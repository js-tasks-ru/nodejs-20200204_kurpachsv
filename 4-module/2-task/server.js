const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitExceededError = require('./LimitExceededError');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

const checkPath = (pathname) => {
  return pathname.indexOf('/') === -1 && pathname.indexOf('..') === -1;
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      try {
        if (!checkPath(pathname) ) {
          res.statusCode = 400;
          res.end();
          return;
        }

        fs.stat(filepath, (err, stats) => {
          if (stats && stats.isFile()) {
            res.statusCode = 409;
            res.end();
            return;
          }
          const ws = fs.createWriteStream(filepath, {flags: 'a'});
          const limitStream = new LimitSizeStream({limit: 1e6});

          req.pipe(limitStream).pipe(ws);

          req.on('end', (err) => {
            if (err) throw err;
            res.statusCode = 201;
            res.end();
          });

          limitStream.on('error', (err) => {
            if (err instanceof LimitExceededError) {
              fs.unlink(filepath, (err) => {
                if (err) {
                  res.statusCode = 500;
                  res.end();
                }
              });
              res.statusCode = 413;
              res.end();
              return;
            }
            res.statusCode = 500;
            res.end();
          });

          req.on('aborted', () => {
            try {
              fs.unlink(filepath, (err) => {
                if (err) {
                  res.statusCode = 500;
                  res.end();
                }
              });
            } catch (e) {
              res.statusCode = 500;
              res.end();
            }
          });

          ws.on('error', () => {
            res.statusCode = 500;
            res.end();
          });
        });
      } catch (e) {
        res.statusCode = 500;
        res.end();
      }
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
