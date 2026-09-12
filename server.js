// Pure static file server (Zero storage - 100% private)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
    let url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    let file = path.join(__dirname, path.normalize(decodeURIComponent(url)).replace(/^(\.\.[\/\\])+/, ''));
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => console.log(`🚀 Can Flyer running at http://localhost:${PORT}`));
