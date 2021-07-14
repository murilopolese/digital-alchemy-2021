let embedForm, extractForm, carrierImage, messageImage, secretImage
let carrierData, messageData, secretData, outputData

// https://stackoverflow.com/questions/37134433/convert-input-file-to-byte-array
function fileToByteArray(file) {
    return new Promise((resolve, reject) => {
        try {
            let reader = new FileReader()
            let fileByteArray = []
            reader.readAsArrayBuffer(file)
            reader.onloadend = (evt) => {
                if (evt.target.readyState == FileReader.DONE) {
                    let arrayBuffer = evt.target.result,
                        array = new Uint8Array(arrayBuffer)
                    for (byte of array) {
                        fileByteArray.push(byte)
                    }
                }
                resolve(fileByteArray)
            }
        }
        catch (e) {
            reject(e)
        }
    })
}

window.onload = function() {
  embedForm = document.querySelector('#embed-form')
  extractForm = document.querySelector('#extract-form')
  carrierImage = document.querySelector('#carrier-image')
  messageImage = document.querySelector('#message-image')
  secretImage = document.querySelector('#secret-image')

  embedForm.addEventListener('submit', function(e) {
    e.preventDefault()
    console.log('embed')
    if (carrierImage.files.length === 0 || messageImage.files.length === 0) {
      console.log('missing file')
      console.log('carrierImage', carrierImage.files)
      console.log('messageImage', messageImage.files)
      return false
    }

    fileToByteArray(carrierImage.files[0])
      .then((data) => console.log(data))


    return false
  })
  extractForm.addEventListener('submit', function(e) {
    e.preventDefault()
    console.log('extract')
    console.log('secretImage', secretImage.files)
    return false
  })
}
