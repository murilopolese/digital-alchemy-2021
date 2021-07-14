// Buffer to array
module.exports = function bufferToArray(buff) {
  return buff.toJSON().data
}
