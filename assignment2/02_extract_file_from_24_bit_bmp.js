const fs = require('fs')
const bufferToArray = require('./util/buffertoarray.js')

// get bmp data
const out = fs.readFileSync('./out1.bmp')

// https://en.wikipedia.org/wiki/BMP_file_format#Bitmap_file_header
const signature = bufferToArray(out.slice(0, 2))
let fileSize = bufferToArray(out.slice(2, 2+4))
const reserved = bufferToArray(out.slice(6, 6+4))
const dataStart = bufferToArray(out.slice(10, 10+4))
const headerSize = bufferToArray(out.slice(14, 14+4))
// Assuming headerSize is 40: Windows BITMAPINFOHEADER
const width = bufferToArray(out.slice(18, 18+4))
const height = bufferToArray(out.slice(22, 22+4))
const colorPlanes = bufferToArray(out.slice(26, 26+2))
const bitsPerPixel = bufferToArray(out.slice(28, 28+2))
const compression = bufferToArray(out.slice(30, 30+4))
let imageSize = bufferToArray(out.slice(34, 34+4))
const hResolution = bufferToArray(out.slice(38, 38+4))
const vResolution = bufferToArray(out.slice(42, 42+4))
const colorAmount = bufferToArray(out.slice(46, 46+4))
const importantColors = bufferToArray(out.slice(50, 50+4))

// read little endian buffer data to interger
const dataStartValue = out.slice(10, 10+4).readUInt16LE(0)
let imageData = bufferToArray(out.slice(dataStartValue))

let secretData = []
for (let i = 0; i < imageData.length; i += 8) {
  let bits = []
  for (let j = 0; j < 8; j++) {
    bits.push(imageData[i+j] & 0b00000001)
  }
  secretData.push(parseInt(bits.join(''), 2))
}

const buff = Buffer.from(secretData)

// Write file to disc
fs.writeFileSync('secret.bmp', buff)
