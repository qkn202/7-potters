import fs from 'fs'

const refPath = '/Users/khang/.gemini/antigravity-ide/brain/e40e3d86-dfc2-40b9-b653-c5a6cb062216/.tempmediaStorage/media_1790918822669.jpg'

// Let's check image size
import sharp from 'sharp'
const meta = await sharp(refPath).metadata()
console.log('Reference Image Metadata:', meta.width, 'x', meta.height)
