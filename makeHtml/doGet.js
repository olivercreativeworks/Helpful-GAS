/**
 * Use this to create a web app via html. The homepage should be named index.html.
 * https://developers.google.com/apps-script/guides/web
 */
function doGet(){
  return HtmlService.createTemplateFromFile("index").evaluate()
}

/**
 * Use this to include other html pages in your web app. You can include it via scriptlets <?= include('fileName')?>
 * Read more about scriplets: https://developers.google.com/apps-script/guides/html/templates
 * @param {string} fileName
 */
function include(fileName){
  return HtmlService.createTemplateFromFile(fileName).getRawContent()
}