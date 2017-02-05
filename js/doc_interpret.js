//Elements have both a text attribute and inner html, sometimes they dont match :| 
// just change this var to pick which one is used
var __USE_TEXT_ATTR__ = false;
function getText (elem) {
    if(__USE_TEXT_ATTR__){
        return elem.getAttribute("text")
    }
    return elem.innerHTML
}
//export the "doc" element to plain HTML
function basicExport () {
    //html document to export
    var stuff = ""
    var rows = $("doc")[0].children
    //everything on tabs at a lower index than the current tab is stored here
    var tab_history = []
    var last_tab  = 0; //index of the last tab read
  for(var i = 0; i < rows.length;i++){
    var items = rows[i].children;
    var type = rows[i].getAttribute("type")
    var current_tab = Number(rows[i].getAttribute("tabs"))
    while(tab_history.length-1 < current_tab){
        tab_history.push([]) //make sure that there's enough space in tab_history for new entries
    }
    for(var o = 0; o < items.length;o++){
    //Not really sure why, but end-tag is in the demo doc but not the dev doc, so it's being
    //checked for just in case
      if(type == "end-tag" || current_tab < last_tab){
          for(var t = last_tab; t > current_tab; t--){
            var column = tab_history[t];
            for(var c in column){
                stuff += "</" + column[c] + ">"
            }
          }
          //get rid of all the elements just written to the stream
          tab_history.splice(current_tab,tab_history.length-current_tab)
          break
      }else
      if(type == "tag"){
          //Hopefully these elements come in the same order as these if-statements,
          //otherwise this could be a problem...
          if(items[o].tagName == "TAG"){
              stuff += "<" + getText(items[o]) + " "
              tab_history[current_tab].push(getText(items[o]))
          }else
          if(items[o].tagName == "PROP"){
              stuff += getText(items[o]) + "="
          }else
          if(items[o].tagName == "VAL"){
              stuff += "\"" + getText(items[o]) + "\""
          }
            if(o == items.length-1){
                stuff += ">"
            }
      }else
      if(type == "txt"){
          stuff += items[o].getAttribute("text")
      }

    }
    last_tab = current_tab
  }
  return stuff
}
