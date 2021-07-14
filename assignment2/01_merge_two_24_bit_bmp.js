const fs = require('fs')
const bufferToArray = require('./util/buffertoarray.js')

// get bmp data
const carrier = fs.readFileSync('./carrier.bmp')
const message = fs.readFileSync('./message.bmp')

// https://en.wikipedia.org/wiki/BMP_file_format#Bitmap_file_header
const signature = bufferToArray(carrier.slice(0, 2))
let fileSize = bufferToArray(carrier.slice(2, 2+4))
const reserved = bufferToArray(carrier.slice(6, 6+4))
const dataStart = bufferToArray(carrier.slice(10, 10+4))
const headerSize = bufferToArray(carrier.slice(14, 14+4))
// Assuming headerSize is 40: Windows BITMAPINFOHEADER
const width = bufferToArray(carrier.slice(18, 18+4))
const height = bufferToArray(carrier.slice(22, 22+4))
const colorPlanes = bufferToArray(carrier.slice(26, 26+2))
const bitsPerPixel = bufferToArray(carrier.slice(28, 28+2))
const compression = bufferToArray(carrier.slice(30, 30+4))
let imageSize = bufferToArray(carrier.slice(34, 34+4))
const hResolution = bufferToArray(carrier.slice(38, 38+4))
const vResolution = bufferToArray(carrier.slice(42, 42+4))
const colorAmount = bufferToArray(carrier.slice(46, 46+4))
const importantColors = bufferToArray(carrier.slice(50, 50+4))

// read little endian buffer data to interger
const dataStartValue = carrier.slice(10, 10+4).readUInt16LE(0)
let imageData = bufferToArray(carrier.slice(dataStartValue))
let messageData = bufferToArray(message)

if (imageData.length < messageData.length * 8) {
  throw new Error('Message must be at least 8 times smaller than image')
}


for (let i = 0; i < messageData.length; i++) {
  let messageByte = messageData[i]
  let bits = [ // Big endian
    (messageByte & 0b10000000) >> 7,
    (messageByte & 0b01000000) >> 6,
    (messageByte & 0b00100000) >> 5,
    (messageByte & 0b00010000) >> 4,
    (messageByte & 0b00001000) >> 3,
    (messageByte & 0b00000100) >> 2,
    (messageByte & 0b00000010) >> 1,
    (messageByte & 0b00000001)
  ]

  // Clear last bit
  for (let j = 0; j < 8; j++) {
    imageData[(i*8)+j] = imageData[(i*8)+j] & 0b11111110
  }

  // Put last bit on image data
  for (let j = 0; j < 8; j++) {
    imageData[(i*8)+j] = imageData[(i*8)+j] | bits[j]
  }
}

let file = [].concat(signature)
  .concat(fileSize)
  .concat(reserved)
  .concat(dataStart)
  .concat(headerSize)
  .concat(width)
  .concat(height)
  .concat(colorPlanes)
  .concat(bitsPerPixel)
  .concat(compression)
  .concat(imageSize)
  .concat(hResolution)
  .concat(vResolution)
  .concat(colorAmount)
  .concat(importantColors)
  .concat(imageData)
const buff = Buffer.from(file)

// Write file to disc
fs.writeFileSync('out1.bmp', buff)
