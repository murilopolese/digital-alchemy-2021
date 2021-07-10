#!/usr/bin/env python

from struct import unpack, pack
import wave

PCM_LE = True  # PCM 32-bit should be Little Endian or Big Endian?
bmp_in ='image.bmp'
wav_in ='audio.wav'
bmp_out='out.bmp'
# BMP created with Gimp as 16-bit R5G6B5
f=open(bmp_in, 'rb').read()
# WAV created with mpg123 -w a.wav a.mp3 (stereo)
w=wave.open(wav_in, 'rb')
class bmp(): pass
class bmpheader(): pass
class bmpdib(): pass
b=bmp()
b.header=bmpheader()
b.dib=bmpdib()

fheader            =f[0:14]
b.header.magic     =fheader[0:2]
assert b.header.magic == "BM"
b.header.filesize, =unpack('<I', fheader[2:6])
b.header.unused1,  =unpack('<H', fheader[6:8])
b.header.unused2,  =unpack('<H', fheader[8:10])
b.header.offdata,  =unpack('<I', fheader[10:14])
fdib               =f[14:b.header.offdata]
fimg               =f[b.header.offdata:]
b.dib.dibsize,     =unpack('<I', fdib[0:4])
assert b.dib.dibsize == len(fdib)
assert b.dib.dibsize >= 56 # at least BITMAPV3HEADER
b.dib.width,       =unpack('<i', fdib[4:8])
b.dib.height,      =unpack('<i', fdib[8:12])
b.dib.planes,      =unpack('<H', fdib[12:14])
b.dib.bpp,         =unpack('<H', fdib[14:16])
assert b.dib.bpp == 16
b.dib.comp,        =unpack('<I', fdib[16:20])
assert b.dib.comp == 3 # BI_BITFIELDS
b.dib.imgsize,     =unpack('<I', fdib[20:24])
assert b.dib.imgsize == b.header.filesize - b.header.offdata
b.dib.hppm,        =unpack('<I', fdib[24:28])
b.dib.vppm,        =unpack('<I', fdib[28:32])
b.dib.colors,      =unpack('<I', fdib[32:36])
b.dib.icolors,     =unpack('<I', fdib[36:40])
b.dib.Rmask,       =unpack('<I', fdib[40:44])
b.dib.Gmask,       =unpack('<I', fdib[44:48])
b.dib.Bmask,       =unpack('<I', fdib[48:52])
b.dib.Amask,       =unpack('<I', fdib[52:56])
b.dib.remaining    =fdib[56:]
b.img              =list(unpack('<'+'H'*(b.dib.imgsize*8/b.dib.bpp), fimg))
b.dib.bpp=32
if PCM_LE:
    b.dib.Rmask <<=16
    b.dib.Gmask <<=16
    b.dib.Bmask <<=16
    b.dib.Amask <<=16
assert w.getnchannels() <= 2     # 1 or 2 channels
assert w.getsampwidth() == 2     # 16-bit
assert w.getcomptype()  == 'NONE'
assert w.getnframes() * w.getnchannels() >= len(b.img)
s=list(unpack('<'+'h'*len(b.img), w.readframes(len(b.img) / w.getnchannels())))
if PCM_LE:
    for i in xrange(len(b.img)):
        b.img[i], = unpack('<I', pack('<hH', s[i], b.img[i]))
else:
    for i in xrange(len(b.img)):
        b.img[i], = unpack('<I', pack('<H', b.img[i]) + pack('>h', s[i]))
b.dib.imgsize = len(b.img) * b.dib.bpp / 8
b.header.filesize = b.dib.imgsize + b.header.offdata
b2=b.header.magic+pack('<IHHIIiiHHIIIIIIIIII', b.header.filesize, b.header.unused1, b.header.unused2, b.header.offdata,
b.dib.dibsize, b.dib.width, b.dib.height, b.dib.planes, b.dib.bpp, b.dib.comp, b.dib.imgsize,
b.dib.hppm, b.dib.vppm, b.dib.colors, b.dib.icolors, b.dib.Rmask, b.dib.Gmask, b.dib.Bmask, b.dib.Amask)
b2+=b.dib.remaining
p={8:'B', 16:'H', 32:'I'}[b.dib.bpp]
b2+=pack('<'+p*(b.dib.imgsize*8/b.dib.bpp), *b.img)
open(bmp_out, 'wb').write(b2)
print '%s written!' % bmp_out
print 'You can play it as signed 32-bit PCM, e.g.:'
print 'cat %s | aplay -r %i -c %i -f S32_%s' % (bmp_out, w.getframerate(), w.getnchannels(), ("BE", "LE")[PCM_LE])
