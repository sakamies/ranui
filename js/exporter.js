//TODO: this should take in ranui dom or html and return plain html
//This needs to also export attributes without a tag and plain text, because this will be used for copy paste too.

const pug = require.main.require('pug')

module.exports = {domToPug, pugToHTML}

function pugToHTML (string) {
  return pug.render(string)
}

function domToPug (rows) {
  rows = rows || $('doc').children('selector')
  let out = ''

  rows.each(function(i, el) {
    let row = $(el)
    let rowType = row.attr('type')
    let tabs = parseInt(row.attr('tabs'))
    let spaces = '  '.repeat(tabs)

    out += spaces
    if (row.hasClass('com')) {
      out += '//'
    }

    if (rowType === 'tag') {
      row.children().each(function(i, el) {
        let token = $(el)
        let tokenType = token[0].tagName
        if (tokenType === 'TAG') {
          out += token.text() + '('
        } else if (tokenType === 'PROP') {
          out += token.text()
        } else if (tokenType === 'VAL') {
          out += '=\'' + token.text() + '\' '
        }
      })
      out += ')'
    } else if (rowType === 'txt') {
      out += '| ' + row.children().first().html()
    }

    out += '\n'

  })

  return out
}



