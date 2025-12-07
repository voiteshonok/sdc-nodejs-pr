const http = require('http');

const server = http.createServer((req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Request Details</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Request Details</h1>
      <div class="detail">
        <span class="label">HTTP Method:</span> ${req.method}
      </div>
      <div class="detail">
        <span class="label">URL:</span> ${req.url}
      </div>
      <div class="detail">
        <span class="label">HTTP Version:</span> ${req.httpVersion}
      </div>
      <div class="detail">
        <span class="label">Request Headers:</span>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>
      </div>
    </body>
    </html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

