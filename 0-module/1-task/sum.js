function sum(a, b) {
  if (typeof a !== 'number' && typeof b !== 'number') {
    throw new TypeError('Args must be numbers');
  }
  return a + b;
}

module.exports = sum;
