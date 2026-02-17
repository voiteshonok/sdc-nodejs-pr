const http = require('http');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const WebSocket = require('ws');

const PORT = 3000;
const WS_PORT = 3001;
const TARGET_DIR = path.join(__dirname, 'public');

// MIME types for common file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

/**
 * Transform stream that injects WebSocket client script before </body> tag
 */
class WebSocketInjector extends Transform {
  constructor() {
    super();
    this.buffer = '';
    this.injected = false;
    // Keep a lookback buffer to catch </body> tags split across chunks
    this.lookbackSize = 10; // Enough to catch "</body>" (7 chars) plus some margin
  }

  _transform(chunk, encoding, callback) {
    if (this.injected) {
      // Already injected, just pass through remaining chunks
      this.push(chunk);
      callback();
      return;
    }

    // Convert chunk to string and add to buffer
    const chunkStr = chunk.toString();
    this.buffer += chunkStr;

    // Search for </body> tag in the buffer
    const bodyTagIndex = this.buffer.indexOf('</body>');
    
    if (bodyTagIndex !== -1) {
      // Found </body> tag - inject script before it
      const beforeBody = this.buffer.substring(0, bodyTagIndex);
      const afterBody = this.buffer.substring(bodyTagIndex);
      
      const wsScript = `
  <script>
    (function() {
      const ws = new WebSocket('ws://localhost:${WS_PORT}');
      
      ws.onopen = function() {
        console.log('WebSocket connected for live reload');
      };
      
      ws.onmessage = function(event) {
        if (event.data === 'reload') {
          console.log('Received reload message, refreshing page...');
          window.location.reload();
        }
      };
      
      ws.onerror = function(error) {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = function() {
        console.log('WebSocket connection closed');
      };
    })();
  </script>`;
      
      // Push everything before </body>, then the script, then </body> and rest
      this.push(Buffer.from(beforeBody + wsScript + afterBody));
      this.injected = true;
      this.buffer = '';
    } else {
      // </body> not found yet - handle potential split tag
      // Keep a lookback buffer to catch cases where </body> is split across chunks
      if (this.buffer.length > this.lookbackSize) {
        // Push everything except the lookback buffer
        const toPush = this.buffer.substring(0, this.buffer.length - this.lookbackSize);
        this.buffer = this.buffer.substring(this.buffer.length - this.lookbackSize);
        this.push(Buffer.from(toPush));
      }
      // If buffer is still small, don't push yet (wait for more data to avoid splitting tags)
    }
    
    callback();
  }

  _flush(callback) {
    // If we haven't injected yet, check the remaining buffer
    if (!this.injected) {
      const bodyTagIndex = this.buffer.indexOf('</body>');
      
      if (bodyTagIndex !== -1) {
        // Found </body> in remaining buffer
        const beforeBody = this.buffer.substring(0, bodyTagIndex);
        const afterBody = this.buffer.substring(bodyTagIndex);
        
        const wsScript = `
  <script>
    (function() {
      const ws = new WebSocket('ws://localhost:${WS_PORT}');
      ws.onopen = function() { console.log('WebSocket connected'); };
      ws.onmessage = function(event) {
        if (event.data === 'reload') {
          window.location.reload();
        }
      };
    })();
  </script>`;
        
        this.push(Buffer.from(beforeBody + wsScript + afterBody));
      } else {
        // No </body> tag found - append script at the end as fallback
        const wsScript = `
  <script>
    (function() {
      const ws = new WebSocket('ws://localhost:${WS_PORT}');
      ws.onopen = function() { console.log('WebSocket connected'); };
      ws.onmessage = function(event) {
        if (event.data === 'reload') {
          window.location.reload();
        }
      };
    })();
  </script>`;
        
        this.push(Buffer.from(this.buffer + wsScript));
      }
    } else if (this.buffer.length > 0) {
      // Already injected, but push any remaining buffer
      this.push(Buffer.from(this.buffer));
    }
    
    callback();
  }
}

/**
 * Get Content-Type header based on file extension
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Serve file using streams
 */
function serveFile(filePath, res) {
  // Resolve the full path to the file
  const fullPath = path.join(TARGET_DIR, filePath);
  
  // Security check: prevent directory traversal attacks
  const resolvedPath = path.resolve(fullPath);
  const resolvedTargetDir = path.resolve(TARGET_DIR);
  
  if (!resolvedPath.startsWith(resolvedTargetDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden: Directory traversal not allowed');
    return;
  }

  // Check if file exists and get stats
  fs.stat(fullPath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }

    // Check if it's a directory
    if (stats.isDirectory()) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden: Cannot serve directories');
      return;
    }

    // Create read stream
    const readStream = fs.createReadStream(fullPath);
    const contentType = getContentType(fullPath);
    const isHtml = path.extname(fullPath).toLowerCase() === '.html';
    
    res.writeHead(200, { 'Content-Type': contentType });
    
    // For HTML files, inject WebSocket client script using transform stream
    if (isHtml) {
      const injector = new WebSocketInjector();
      
      // Handle transform stream errors
      injector.on('error', (err) => {
        console.error('Transform stream error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error processing file');
        } else {
          res.end();
        }
      });
      
      readStream.pipe(injector).pipe(res);
    } else {
      // For non-HTML files, pipe directly
      readStream.pipe(res);
    }
    
    // Handle read stream errors
    readStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
      } else {
        res.end();
      }
    });
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = url.pathname;

  // Default to index.html for root path
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Remove leading slash to get relative path
  filePath = filePath.substring(1);

  // Serve the file
  serveFile(filePath, res);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${TARGET_DIR}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Create WebSocket server for live reload
const wss = new WebSocket.Server({ port: WS_PORT });

// Store all connected clients explicitly
const connectedClients = new Set();

wss.on('listening', () => {
  console.log(`WebSocket Server is running on ws://localhost:${WS_PORT}`);
});

wss.on('connection', (ws) => {
  // Add client to the set of connected clients
  connectedClients.add(ws);
  console.log(`WebSocket client connected. Total clients: ${connectedClients.size}`);
  
  // Send welcome message to the newly connected client
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to live reload server',
    timestamp: new Date().toISOString()
  }));
  console.log('Welcome message sent to client');
  
  ws.on('message', (message) => {
    const messageStr = message.toString();
    console.log(`Received message from client: ${messageStr}`);
    
    // Echo the message back (optional, for testing)
    // ws.send(`Echo: ${messageStr}`);
  });
  
  ws.on('close', () => {
    // Remove client from the set when disconnected
    connectedClients.delete(ws);
    console.log(`WebSocket client disconnected. Remaining clients: ${connectedClients.size}`);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    // Remove client on error
    connectedClients.delete(ws);
  });
});

// Handle WebSocket server errors
wss.on('error', (err) => {
  console.error('WebSocket Server error:', err);
});

/**
 * Broadcast a message to all connected clients
 * @param {string} message - The message to broadcast
 */
function broadcast(message) {
  let sentCount = 0;
  let errorCount = 0;
  
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error('Error sending message to client:', error);
        errorCount++;
        // Remove client if sending fails
        connectedClients.delete(client);
      }
    } else {
      // Remove clients that are not in OPEN state
      connectedClients.delete(client);
    }
  });
  
  console.log(`Broadcast sent to ${sentCount} client(s)${errorCount > 0 ? `, ${errorCount} error(s)` : ''}`);
  return { sent: sentCount, errors: errorCount };
}

/**
 * Broadcast reload message to all connected clients
 */
function broadcastReload() {
  return broadcast('reload');
}

/**
 * Check if a file should be ignored (temporary/editor files)
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if file should be ignored
 */
function shouldIgnoreFile(filename) {
  const ignoredPatterns = [
    /^\./,                    // Hidden files (starts with dot)
    /\.swp$/,                 // Vim swap files
    /\.tmp$/,                 // Temporary files
    /~$/,                     // Backup files ending with ~
    /\.DS_Store$/,            // macOS directory metadata
    /\.git/,                  // Git files
    /node_modules/,           // Node modules
    /\.log$/,                 // Log files
  ];
  
  return ignoredPatterns.some(pattern => pattern.test(filename));
}

/**
 * Watch the target directory for file changes and trigger reload
 */
function watchDirectory() {
  let reloadTimeout = null;
  const DEBOUNCE_DELAY = 100; // 100ms debounce delay
  
  // Watch the target directory
  const watcher = fs.watch(TARGET_DIR, { recursive: true }, (eventType, filename) => {
    // Ignore if no filename (can happen on some systems)
    if (!filename) {
      return;
    }
    
    // Check if file should be ignored
    if (shouldIgnoreFile(filename)) {
      console.log(`Ignoring change to temporary file: ${filename}`);
      return;
    }
    
    // Clear existing timeout to debounce multiple events
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }
    
    // Set new timeout to trigger reload after debounce delay
    reloadTimeout = setTimeout(() => {
      console.log(`File changed: ${filename} (${eventType})`);
      
      // Only reload if there are connected clients
      if (connectedClients.size > 0) {
        console.log('Broadcasting reload to connected clients...');
        broadcastReload();
      } else {
        console.log('No connected clients to reload');
      }
      
      reloadTimeout = null;
    }, DEBOUNCE_DELAY);
  });
  
  watcher.on('error', (error) => {
    console.error('File watcher error:', error);
  });
  
  console.log(`Watching directory for changes: ${TARGET_DIR}`);
  return watcher;
}

// Start watching the target directory
const fileWatcher = watchDirectory();

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  if (fileWatcher) {
    fileWatcher.close();
    console.log('File watcher closed');
  }
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  if (fileWatcher) {
    fileWatcher.close();
    console.log('File watcher closed');
  }
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

// Export for potential use (e.g., file watcher or test script)
module.exports = { 
  broadcastReload,
  broadcast,
  getConnectedClientsCount: () => connectedClients.size
};
