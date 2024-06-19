/**
 * @param {string} driveFileId
 * @param {string} driveFolderId
 * @return {{pdf:DriveApp.File, folder:DriveApp.Folder}}
 */
function driveFileToPdf(driveFileId, driveFolderId){
  const sourceFile = DriveApp.getFileById(driveFileId)

  Logger.log(`Converting ${sourceFile.getName()} from ${sourceFile.getMimeType()} into pdf`)
  const blob = sourceFile.getBlob().getAs('application/pdf')
  
  Logger.log(`Moving pdf version of ${sourceFile.getName()} to ${folder.getName()}`)
  const folder = DriveApp.getFolderById(driveFolderId)
  const pdf = DriveApp.createFile(blob).moveTo(folder)
  
  return {pdf, folder}
}