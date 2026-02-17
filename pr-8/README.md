# PR-8: Basic HTTP Server with Streams

This project implements a basic HTTP server that serves static files using Node.js streams.

## Features

- **Stream-based file serving**: Uses `fs.createReadStream` to pipe file content to HTTP responses
- **Path mapping**: Maps request paths to files in the `public` directory
- **Error handling**: Handles file not found (404), forbidden access (403), and server errors (500)
- **Content-Type detection**: Automatically sets appropriate Content-Type headers based on file extensions
- **Security**: Prevents directory traversal attacks

## Project Structure

```
pr-8/
├── index.js          # Main server file
├── package.json      # Project configuration
├── README.md         # This file
└── public/           # Target directory for static files
    ├── index.html    # Test HTML file
    ├── styles.css    # Test CSS file
    └── script.js     # Test JavaScript file
```

## How It Works

1. The server listens on port 3000
2. When a request comes in, it maps the URL path to a file in the `public` directory
3. Uses `fs.createReadStream` to create a readable stream from the file
4. Pipes the stream directly to the HTTP response using `.pipe(res)`
5. Handles errors appropriately with status codes:
   - **404**: File not found
   - **403**: Forbidden (directory traversal attempts or directory access)
   - **500**: Internal server error

## Usage

1. Start the server:
   ```bash
   node index.js
   ```

2. Open your browser and navigate to:
   - `http://localhost:3000/` - Serves `index.html`
   - `http://localhost:3000/styles.css` - Serves CSS file
   - `http://localhost:3000/script.js` - Serves JavaScript file

3. Test error handling:
   - `http://localhost:3000/nonexistent.html` - Should return 404

## Supported File Types

The server recognizes and sets appropriate Content-Type headers for:
- HTML (`.html`)
- CSS (`.css`)
- JavaScript (`.js`)
- JSON (`.json`)
- Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`)
- Text (`.txt`)

## Benefits of Using Streams

- **Memory efficient**: Files are streamed in chunks rather than loaded entirely into memory
- **Better performance**: Large files can be served without consuming excessive memory
- **Non-blocking**: Streams allow for better handling of concurrent requests

## Error Handling

The server handles various error scenarios:

- **ENOENT**: File doesn't exist → 404 Not Found
- **Directory traversal**: Attempts to access files outside `public` → 403 Forbidden
- **Directory access**: Attempts to access directories → 403 Forbidden
- **Stream errors**: Errors during file reading → 500 Internal Server Error

