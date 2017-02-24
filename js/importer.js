module.exports = {renderDoc, renderRows, renderProps}

function renderDoc (doc) {
  return rows(doc.rows)
}

function renderRows (rows) {
  let out = ''
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i]
    let props = importer.renderProps(row.props)
    out += `<row tabs="${row.tabs}" type="${row.type}">${props}</row>`
  }
  return out
}

function renderProps (props) {
  let out = ''
  for (let i = 0; i < props.length; i++) {
    let prop = props[i]
    let type = prop.type
    let text = prop.text
    out += `<${type} text="${text}" class="new">${text}</${type}>`
  }
  return out
}

