let dragTimer
let mouseIsDown = false
let dragging = false
let dragSources = null
let dragGhosts = null
let droppables = ['ROW','TAG','PROP','VAL','TXT']
let dropTarget = null

//TODO: add undo support here

function mousedown(e) {
  //Allow mouse to function according to platform defaults when editing text, also this way there's no need to worry about editing mode for the rest of this function & other mouse events.
  if (e.target.contenteditable === true) {return}
  else if (HI.scope ==='editing:') {commitEdit()}

  e.preventDefault()
  let target = $(e.target)
  mouseIsDown = true
  HI.pushScope('paintselection')

  if (!target.hasClass('sel')) {
    selTarget(e)
  }

  dragTimer = setTimeout(()=>{
    HI.popScope('paintselection')
    HI.pushScope('dragging')
    dragging = true
    dragSources = $('.sel')
    dragGhosts = dragSources.clone()
    dragSources.addClass('dragsource')
  }, 250)
}

function mousemove(e) {
  //Efficiency galore yay, but I want to determine the drop point based on where the mouse is on a dropzone

  clearTimeout(dragTimer)
  let target = $(e.target)
  //paint a selection or drag, based on how long mouse was down before move
  if (dragging && droppables.includes(e.target.tagName)) {
    if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}
    dropTarget = target

    let hitbox = e.target.getBoundingClientRect()
    let centerX = hitbox.left + hitbox.width / 2
    let centerY = hitbox.top + hitbox.height / 2

    if (e.clientX < centerX) {
      dropTarget.addClass('dropbefore')
    } else {
      dropTarget.addClass('dropafter')
    }
  } else if (mouseIsDown) {
    selTarget(e, ':add')
  }

}

function mouseup(e) {

  //e.preventDefault()
  clearTimeout(dragTimer)
  let target = $(e.target)

  //if we got a click on an already selected element, should collapse selection to it, this might a be tricky one

  if (dropTarget && dragging && droppables.includes(e.target.tagName)) {
    dragSources.removeClass('dragsource')
    if (dropTarget.hasClass('dropafter')) {
      dropTarget.after(dragSources)
    } else if (dropTarget.hasClass('dropbefore')) {
      dropTarget.before(dragSources)
    }
  }

  if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}
  if (dragGhosts) {dragGhosts.remove()}

  dropTarget = null
  dragSources = null
  dragGhosts = null
  mouseIsDown = false
  dragging = false
  HI.popScope('dragging')
  HI.popScope('paintselection')
}


