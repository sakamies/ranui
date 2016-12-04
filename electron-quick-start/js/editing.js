function startEdit (event) {
  //Needs to support multiple cursors, so pressing enter edits the first selected item but all other selected elements are synced to that input
  let sel = $('.sel')
  let cursor = sel.first()
  cursor.prop('contenteditable', 'true').focus().selectText()
  event.preventDefault()
  HI.pushScope('editing')
}

function commitEdit(event) {
  $('[contenteditable]').prop('contenteditable', 'false')
  HI.popScope('editing')
}


function edit (event) {
  let sel = $('.sel')
  if (sel.length > 1) {
    let clones = sel
    let master = $(clones.splice(0,1))
    clones.text(master.text())
  }
}
