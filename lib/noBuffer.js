module.exports = str => {
  return Buffer.isBuffer(str) ? JSON.parse(str.toString()) : str
}
