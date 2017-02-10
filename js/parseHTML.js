module.exports = parseHTML


function parseHTML (htmlString) {

  //Check if string is like <attr="something" attr2="something"> and if it is, treat is as a bunch of attributes, although browsers would create an element or something crazy.
  if (htmlString.match(/^<\w*=".*">$/)) {
    let props = []
    let attrs = htmlString.slice(1, -2).split('" ') //Remove < and > from start & end and split string at attribute boundaries. Also props always need a valuve inside quotes, even if the value is empty. Quotes should always be encoded insite attributes. This is not really very robust, but works for now.
    console.log('split attrs', attrs)
    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i]
      let pv = attr.split('="')
      props.push({
        type: 'prop',
        text: pv[0]
      })
      if (pv[1]) {
        props.push({
          type: 'val',
          text: pv[1]
        })
      }
    }
    console.log(props)
    return {
      type: 'props',
      props: props
    }
  }

  else if (htmlString) {
    let rows = HTMLstring(htmlString)
    let doc = {
      type: 'rows',
      rows: rows
    }
    return doc
  }

  else {
    return []
  }
}

//All these processing methods return an array of rows
function HTMLstring (htmlString, depth, commented) {
  if (!commented) {commented = false}
  let rows = []
  if (!depth) {
    depth = 0
  }
  if (htmlString.indexOf('<!DOCTYPE') != -1 || htmlString.indexOf('<!doctype') != -1) {
    inputDom = document.implementation.createHTMLDocument('')
    inputDom.documentElement.innerHTML = htmlString
    rows = rows.concat(domNode(inputDom, depth, commented))
  } else {
    inputDom = document.createElement('template')
    inputDom.innerHTML = htmlString
    rows = rows.concat(domNode(inputDom.content, depth, commented))
  }
  return rows
}

function domNode (node, depth, commented) {
  //takes a node (that can have children), returns an array of rows
  let rows = []
  if (node.nodeType === 1) {
    rows = rows.concat(elementNode(node, depth, commented))
  }
  else if (node.nodeType === 3) {
    let textRows = textNode(node, depth, commented)
    if (textRows) {
      rows = rows.concat(textRows)
    }
  }
  else if (node.nodeType === 8) {
    rows = rows.concat(commentNode(node, depth, commented))
  }
  else if (node.nodeType === 10) {
    rows = rows.concat(doctypeNode(node, depth, commented))
  }
  //if node is a full document or document fragment node, recurse over children
  else if (node.nodeType === 9 || node.nodeType === 11) {
    rows = rows.concat(documentNode(node, depth, commented))
  }

  return rows
}

function elementNode (node, depth, commented) {
  let rows = []
  let props = []

  props.push({
    type: 'tag',
    text: node.nodeName.toLowerCase()
  })

  //We want to sort id & class first, se process them separately and explude them from the generic attribute gathering
  if (node.hasAttribute('id')) {
    props.push({type: 'prop', text: 'id'})
    props.push({type: 'val', text: node.getAttribute('id')})
  }
  if (node.hasAttribute('class')) { //TODO: this should match all attribute names that have values that are space delimited lists
    props.push({type: 'prop', text: 'class'})
    const classes = node.getAttribute('class').split(' ')
    for (var i = 0; i < classes.length; i++) {
      let cls = classes[i]
      props.push({type: 'val', text: cls})
    }
  }
  for (let i = 0; i < node.attributes.length; i++) {
    let attr = node.attributes[i]
    if (false === ['id','class'].includes(attr.name.toLowerCase())) {
      props.push({
        type: 'prop',
        text: attr.name
      })
      props.push({
        type: 'val',
        text: attr.value
      })
    }
  }
  row = {
    type: 'tag',
    commented: commented,
    tabs: depth,
    props: props
  }
  rows.push(row)

  //recurse over children if there are any and add to output after row
  if (node.childNodes.length != 0) {
    for (let childNum = 0; childNum < node.childNodes.length; childNum++) {
      rows = rows.concat(domNode(node.childNodes[childNum], depth+1, commented))
    }
  }
  return rows
}

function textNode (node, depth, commented) {
  //TODO: how to handle the case where there's like "<span></span>text", so there's no whitespace after a tag. Since the text will be on its own row that no whitespace situation should probably be noted somehow, maybe with the >< whitespace eating crocodiles syntax. Also if there's some text and then a line break, should the line break + whitespace be cleaned up?
  //TODO: handle whitespace inside pre, code, textarea (etc?) elements somehow. Check ['pre', 'code'].indexOf($().parents().nodeName)) or something
  /*TODO:
    - split text nodes on any '\n', so each row is a row in the doc too
    - trim rows and somehow smartly add tabs, impossibble to do totally reliably, with all the mixes space & tab combos and such
  */
  let textContent = node.textContent
  let texts = []
  let rows = []

  if (textContent.match(/^\s*\n\s*$/)) { //Skip text that's probably only whitespace for formatting the html. TODO: a line break will add a text node that will affect inline(-block) element rendering, so this needs to be pretty smart
    return false
  } else if (textContent.match(/^\s+$/)) {
    texts = [textContent]
  } else {
    texts = textContent.trim().split('\n')
  }
  //TODO: text.match(/^\s+$/) !?!?

  for (let i = 0; i < texts.length; i++) {
    let props = []
    let row = {}
    props.push({
      type: 'txt',
      text: texts[i], //TODO: trim away only as much spaces as depth needs from the front of the string
    })
    row = {
      type: 'txt',
      commented: commented,
      tabs: depth,
      props: props
    }
    rows.push(row)
  }

  return rows
}

function commentNode (node, depth, commented) {
  //Contents of commentnode get parsed as html, so they're not just some blubber of text, but evetyrhint that gets parsed inside a comment node will be marked as commented out rows
  let rows = []
  commented = true
  rows = rows.concat(HTMLstring(node.textContent, depth, commented))
  return rows
}

function doctypeNode (node, depth, commented) {
  return [{
    commented: commented,
    tabs: depth,
    props: [{
      type: 'tag',
      text: '!doctype'
    }]
  }]
}

function documentNode (node, depth, commented) {
  let rows = []
  if (node.childNodes.length != 0) {
    for (let childNum = 0; childNum < node.childNodes.length; childNum++) {
      rows = rows.concat(domNode(node.childNodes[childNum], depth, commented))
    }
  }
  return rows
}
