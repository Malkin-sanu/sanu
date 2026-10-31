const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  
  // Normalize path and prevent directory traversal
  const safePath = path.normalize(decodeURIComponent(reqPath)).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback: check subfolders if requested at root, or root if requested in subfolder
        const altPaths = [
          path.join(__dirname, 'css', safePath),
          path.join(__dirname, 'js', safePath),
          path.join(__dirname, 'assets', 'images', safePath),
          path.join(__dirname, 'assets', 'images', 'gallery', safePath),
          path.join(__dirname, path.basename(safePath))
        ];

        for (const alt of altPaths) {
          if (fs.existsSync(alt) && fs.statSync(alt).isFile()) {
            return fs.readFile(alt, (altErr, altContent) => {
              if (!altErr) {
                res.writeHead(200, { 'Content-Type': contentType });
                return res.end(altContent);
              }
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            });
          }
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
