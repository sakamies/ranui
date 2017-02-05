//TODO: this should take in ranui dom or html and export plain html
//This needs to also export attributes without a tag and plain text, because this will be used for copy paste too.
module.exports = {
  "requestExport": requestExport
}
var ipc = require("electron").ipcMain;

function requestExport (win,callback) {
  win.webContents.executeJavaScript(
    `require('electron').ipcRenderer.send('export_doc', basicExport());`);

  ipc.on('export_doc', (_, exp) => {
    callback(exp);
  })

}