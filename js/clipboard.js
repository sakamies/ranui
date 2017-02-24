function beforeCopy (e) {
  console.log('beforeCopy')
}

function copy (e) {
  console.log('copy')
  //TODO: copy needs to copy plain text in editing mode, no frigging rich text

  //if (e && e.preventDefault) {e.preventDefault()}

  if (scope === '') {
    let selRows = $('.hilite')
    console.log(selRows[0])
    if (selRows.length) {
      let renderedPug = exporter.domToPug(selRows)
      let renderedHTML = exporter.pugToHTML(renderedPug)
      console.log(renderedPug)
      console.log(renderedHTML)

      event.preventDefault()
      e.clipboardData.setData('text/plain', renderedHTML);
    }

    /*TODO:
      - get .sel
      - do the same as drag & drop does when starting to drag
        - gather elements
        - normalise tabs
      - use exporter.domToPug to render to pug
      - install pug via npm
      - use pug to parse exporters output to plain html
    */

  }
}

function beforeCut (e) {
console.log('beforeCut')
}

function cut (e) {
  console.log('cut')
  //Cut is just copy + delete, right?

  //TODO: cut needs to copy plain text in editing mode, no frigging rich text

  if (scope !== 'editing') {
    if (e && e.preventDefault) {e.preventDefault()}

  }
}

function paste (e) {

  //TODO: regular paste needs to prevent contenteditable from pasting styles, or clean up html after paste

  if (scope !== 'editing') {
    history.update()

    if (e && e.preventDefault) {e.preventDefault()}

    //TODO: this needs the exact same smarts for tab handling as drag & drop

    const cur = $('.cur')
    //TODO: check for text/html data, if there's none, get text/plain and parse that as html
    const clip = event.clipboardData.getData('text/plain')
    const data = importer.parseHTML(clip)

    if (data.type === 'props') {
      //Paste in like <attr1="jotai" attr2="dingus">
      let dom = importer.renderProps(data.props)
      cur.after(dom)
    } else if (data.type === 'rows') {
      //Paste in like <div class="dsa">dsa</div>
      let dom = importer.renderRows(data.rows)
      cur.parent().after(dom)
    }

    cur.removeClass('cur')
    let newSel = $('.new').removeClass('new')
    newSel.last().addClass('cur')
    select(newSel)

    history.add()
  }
}
