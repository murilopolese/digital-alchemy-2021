const fs = require('fs')
const bufferToArray = require('./util/buffertoarray.js')

const bmp = fs.readFileSync('./out2.bmp')

// https://en.wikipedia.org/wiki/BMP_file_format#Bitmap_file_header
const signature = bufferToArray(bmp.slice(0, 2))
let fileSize = bufferToArray(bmp.slice(2, 2+4))
const reserved = bufferToArray(bmp.slice(6, 6+4))
const dataStart = bufferToArray(bmp.slice(10, 10+4))
const headerSize = bufferToArray(bmp.slice(14, 14+4))
// Assuming headerSize is 40: Windows BITMAPINFOHEADER
const width = bufferToArray(bmp.slice(18, 18+4))
const height = bufferToArray(bmp.slice(22, 22+4))
const colorPlanes = bufferToArray(bmp.slice(26, 26+2))
const bitsPerPixel = bufferToArray(bmp.slice(28, 28+2))
const compression = bufferToArray(bmp.slice(30, 30+4))
let imageSize = bufferToArray(bmp.slice(34, 34+4))
const hResolution = bufferToArray(bmp.slice(38, 38+4))
const vResolution = bufferToArray(bmp.slice(42, 42+4))
const colorAmount = bufferToArray(bmp.slice(46, 46+4))
const importantColors = bufferToArray(bmp.slice(50, 50+4))

// read little endian buffer data to interger
const dataStartValue = bmp.slice(10, 10+4).readUInt16LE(0)
let imageData = bufferToArray(bmp.slice(dataStartValue))

// Change bbp to 16
bitsPerPixel[0] = 0x10

let bmpData = []
let wavData = []
for (let i = 0; i < imageData.length; i += 2) {
  bmpData.push(imageData[i])
  wavData.push(imageData[i+1])
}

// Write wav file
fs.writeFileSync('out3.wav', Buffer.from(wavData))

const diffImageLength = imageData.length
imageData = bmpData
// Change image size
let imageSizeValue = bmp.slice(34, 34+4).readUInt16LE(0) + diffImageLength
const newImageSize = Buffer.alloc(4)
newImageSize.writeUInt16LE(imageSizeValue)
imageSize = bufferToArray(newImageSize)

// Change file size
let fileSizeValue = bmp.slice(2, 2+4).readUInt16LE(0) + diffImageLength
const newFileSize = Buffer.alloc(4)
newFileSize.writeUInt16LE(fileSizeValue)
fileSize = bufferToArray(newFileSize)

// Get file array
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
fs.writeFileSync('out3.bmp', buff)
