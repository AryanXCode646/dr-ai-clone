// Node 26+ compatibility polyfill for legacy dependencies relying on buffer.SlowBuffer
const buffer = require('buffer');
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
