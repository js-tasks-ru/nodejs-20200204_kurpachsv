const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      checkPath(pathname, res, () => {
        checkFile(filepath, res, () => {
          sendFile(filepath, res);
        });
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

function checkPath(pathname, res, cb) {
  if (pathname.indexOf('/') !== -1) {
    res.statusCode = 400;
    res.end('Wrong path');
    return;
  }
  cb();
}

function checkFile(filepath, res, cb) {
  fs.stat(filepath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }
    cb();
  });
}

function sendFile(filepath, res) {
  fs.readFile(filepath, (err, content) => {
    if (err) throw err;
    res.end(content);
  });
}

module.exports = server;
