// https://afterthoughtsoftware.com/posts/convert-rgb888-to-rgb565
module.exports = function rgb888torgb565(rgb888Pixel) {
    const red   = rgb888Pixel[0]
    const green = rgb888Pixel[1]
    const blue  = rgb888Pixel[2]

    const b = (blue >> 3) & 0x1f
    const g = ((green >> 2) & 0x3f) << 5
    const r = ((red >> 3) & 0x1f) << 11

    return (r | g | b)
}
