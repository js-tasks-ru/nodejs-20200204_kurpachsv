const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    const [first, last] = chunk.toString().split(os.EOL);
    this.buffer += first;
    if (first && last) {
      this.push(this.buffer);
      this.buffer = last;
    }
    callback(null);
  }

  _flush(callback) {
    this.push(this.buffer);
    callback(null);
  }
}

module.exports = LineSplitStream;
