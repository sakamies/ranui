function beforeCopy (e) {
  console.log('beforeCopy')
}
function copy (e) {
  e.preventDefault()

  if (scope === '') {
    let selRows = $('.hilite')
    if (selRows.length) {
      e.preventDefault()
      /*TODO:
        - get .sel
        - do the same as drag & drop does when starting to drag
          - gather elements
          - normalise tabs
        - use exporter.domToPug to render to pug
        - install pug via npm
        - use pug to parse exporters output to plain html
      */
      let renderedPug = exporter.domToPug(selRows)
      let renderedHTML = exporter.pugToHTML(renderedPug)
      console.log(renderedPug)
      console.log(renderedHTML)

      //Needs to be text/plain so pasting works in text editors etc. We could use custom data for internal copy & paste, but I think the system should be robus enough that copy & paste works with only plain html code.
      console.log(renderedHTML)
      e.clipboardData.setData('text/plain', renderedHTML)
      return
    }

    let sel = $('.sel')
    if (sel.length) {
      console.log(sel)
      //TODO: combine props to a single row and parse them to html
    }
  } else if (scope === 'editing') {
    //Let's only copy plain text when editing a prop
    let text = window.getSelection().toString()
    e.clipboardData.setData('text/plain', text)
  }
}

function beforeCut (e) {
  console.log('beforeCut')
}
function cut (e) {
  if (scope === '') {
    e.preventDefault()
    copy(e)
    del()
  } else if (scope === 'editing') {
    //TODO: cut needs to copy plain text in editing mode, no frigging rich text
  }
}

function paste (e) {

  //TODO: regular paste needs to prevent contenteditable from pasting styles, or clean up html after paste

  if (scope === '') {

    history.update()

    e.preventDefault()

    //TODO: this needs the exact same smarts for tab handling as drag & drop

    const cur = $('.cur')
    const clip = event.clipboardData.getData('text/plain')
    const data = importer.parseHTML(clip)

    if (data.type === 'props') {
      //Paste in like <attr1="jotai" attr2="dingus">
      let dom = importer.renderProps(data.props)
      cur.after(dom)
    } else if (data.type === 'rows') {
      //Paste in like <div class="dsa">dsa</div>
      let dom = importer.renderRows(data.rows)
      //TODO: needs tab smarts here too
      cur.parent().after(dom)
    }

    cur.removeClass('cur')
    let newSel = $('.new')
    if (data.type === 'props') {
      newSel.last().addClass('cur')
    } else if (data.type === 'rows') {
      newSel.last().parent().children().first().addClass('cur')
    }
    newSel.removeClass('new')
    select(newSel)

    history.add()

  } else if (scope === 'editing') {

    e.preventDefault()
    let text = e.clipboardData.getData("text/plain")
    document.execCommand("insertHTML", false, text)

  }
}
