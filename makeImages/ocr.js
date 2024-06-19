class OpticalCharacterRecognition{
  /** 
   * Requires the advanced Drive service
   * How to enable: https://developers.google.com/apps-script/guides/services/advanced#enable_advanced_services
   * About the Drive service: https://developers.google.com/apps-script/advanced/drive
   * @param {DriveApp.File} file
   */
  static createOcrCopy(file){       
      // Get a blob of the file
      const blob = file.getBlob().setContentType("image/png")
      
      // Set up the parameters to use when inserting the file
      const resource = {
        title: file.getName(),
        mimeType: blob.getContentType()
      }
      const options = {
        ocr: true // This part allows us to "read" the text in images
      }
      // Insert the copy of the file.
      Logger.log(blob)
      Logger.log(resource)
      Logger.log(options)
      const ocrFile = Drive.Files?.insert(resource, blob, options)
      return ocrFile
  }

  /**
   * @template A
   * @param {DriveApp.File} file
   * @param {(arg:Drive_v2.Drive.V2.Schema.File) => A} fnToUseOcrCopy
   */
  static useTempOcrCopy(fileToCopy, fnToUseOcrCopy){
      const ocrCopy = OpticalCharacterRecognition.createOcrCopy(fileToCopy)
      if(typeof(ocrCopy?.id) !== "string"){ throwInvalidFileContent(fileToCopy.getUrl()) }
      
      const result = fnToUseOcrCopy(ocrCopy)
      Drive.Files?.remove(ocrCopy.id)
      return result
    }

  static throwInvalidFileContent(url){
      throw new Error(`The Optical Character Recognition service was unable to produce a valid ocr copy for the file with url: ${url}`)
  }
}  