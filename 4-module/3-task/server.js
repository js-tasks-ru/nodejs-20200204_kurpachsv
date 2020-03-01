const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const checkPath = (pathname) => {
  return pathname.indexOf('/') === -1 && pathname.indexOf('..') === -1;
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (!checkPath(pathname)) {
        res.statusCode = 400;
        return res.end();
      }
      fs.stat(filepath, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            return res.end();
          }
          throw err;
        }
        fs.unlink(filepath, (err) => {
          if (err) throw err;
          res.statusCode = 200;
          res.end();
        });
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
