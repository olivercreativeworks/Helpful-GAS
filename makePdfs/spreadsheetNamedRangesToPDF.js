/**
 * The function creates a pdf from specific named ranges in the given spreadsheet. It works by copying the given spreadsheet and deleting data in the copy that falls outside of the named ranges we're looking for. The copied spreadsheet is converted to a PDF before being put in the user's trash. 
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet
 * @param {string[]} rangeNames
 * @param {string} pdfName
 * @param {string} destinationFolderId
 */
function createPdfFromSpreadsheetNamedRanges(spreadsheet, rangeNames, pdfName, destinationFolderId){
  const spreadsheetCopy = spreadsheet.copy("Temporary spreadsheet")
  try{   
    const copiedData = rangeNames.map(findRangeAndCopyToNewSheet(spreadsheetCopy))
    
    removeSheetsWithoutCopiedData(spreadsheetCopy, copiedData)
    
    return createPdf(spreadsheetCopy, pdfName, destinationFolderId)
  }catch(err){
    console.warn(err)
    throw err
  }
  finally{
    DriveApp.getFileById(spreadsheetCopy.getId()).setTrashed(true)
  }
}

/**
 * @param {SpreadsheetApp.Spreadsheet} spreadsheetCopy
 * @return {(rangeName:string) => SpreadsheetApp.Range}
 */
function findRangeAndCopyToNewSheet(spreadsheetCopy){
  return rangeName => {

    const sourceRange = spreadsheetCopy.getRangeByName(rangeName)
    if(!sourceRange){
      throw new Error(`Could not find named range: ${rangeName}.\n\nDouble check the spelling and capitalization of your named ranges.`)
    }

    // insert a sheet and provision a range to copy data to
    const newSheet = spreadsheetCopy.insertSheet()
    const destinationRange = newSheet.getRange(1, 1, sourceRange.getNumRows(), sourceRange.getNumColumns())
    
    // copy the data values and formatting to the provisioned range
    sourceRange.copyTo(destinationRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES, false)
    sourceRange.copyTo(destinationRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false)

    // set the column widths in the destination range to be the same as in the source range
    const startColumn = sourceRange.getColumn()
    const endColumn = sourceRange.getLastColumn()
    const sourceSheet = sourceRange.getSheet()

    for(
      let sourceIndex = startColumn, destinationIndex = 1; 
      sourceIndex <= endColumn; 
      sourceIndex++, destinationIndex++
    ){
      newSheet.setColumnWidth(destinationIndex, sourceSheet.getColumnWidth(sourceIndex))
    }

    return destinationRange
  }
}

/**
 * @param {SpreadsheetApp.Spreadsheet} spreadsheetCopy
 * @param {SpreadsheetApp.Range[]} copiedData
 */
function removeSheetsWithoutCopiedData(spreadsheetCopy, copiedData){

  const sheetIdsToKeep = copiedData.map(data => data.getSheet().getSheetId())
    
  // Remove any sheets that do not contain copied data
  spreadsheetCopy.getSheets()
    .filter(sheet => !sheetIdsToKeep.includes(sheet.getSheetId()))
    .forEach(sheet => spreadsheetCopy.deleteSheet(sheet))
}

/**
 * @param{SpreadsheetApp.Spreadsheet} spreadsheetCopy
 * @param {string} pdfName
 * @param {string} folderId
 */
function createPdf(spreadsheetCopy, pdfName, folderId){
  const driveFile = DriveApp.getFileById(spreadsheetCopy.getId())
  const blob = driveFile.getBlob().getAs('application/pdf')

  const pdf = DriveApp.createFile(blob)
    .setName(pdfName)
    .moveTo(DriveApp.getFolderById(folderId))

  return pdf
}