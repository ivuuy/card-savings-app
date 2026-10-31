export const chooseCover = () => chooseSizedPhoto(960, 540, '16:9')
export const choosePortrait = () => chooseSizedPhoto(720, 1080, '2:3')

function chooseSizedPhoto(width, height, cropScale) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album'], success: async res => {
      try {
        let path = res.tempFilePaths[0]
        // #ifdef H5
        path = await new Promise((done, fail) => {
          const image = new Image()
          image.onload = () => { try { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const context = canvas.getContext('2d'); const scale = Math.max(width / image.width, height / image.height); context.drawImage(image, (width - image.width * scale) / 2, (height - image.height * scale) / 2, image.width * scale, image.height * scale); done(canvas.toDataURL('image/jpeg', 0.86)) } catch (e) { fail(e) } }
          image.onerror = fail; image.src = path
        })
        // #endif
        // #ifndef H5
        if (uni.cropImage) { path = await new Promise((done, fail) => uni.cropImage({ src: path, cropScale, success: r => done(r.tempFilePath), fail })) }
        path = await new Promise((done, fail) => uni.saveFile({ tempFilePath: path, success: r => done(r.savedFilePath), fail }))
        // #endif
        resolve(path)
      } catch (e) { reject(new Error('图片处理失败，请换一张图片')) }
    }, fail: () => reject(new Error('已取消选择')) })
  })
}
