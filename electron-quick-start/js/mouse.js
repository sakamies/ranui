let dragTimer
let mouseIsDown = false
let dragging = false
let dragSources = null
let dragGhost = null
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

  if (!target.hasClass('sel') && !target.hasClass('hilite')) {
    selTarget(e)
  }

  dragTimer = setTimeout(()=>{
    HI.popScope('paintselection')
    HI.pushScope('dragging')
    dragging = true

    //Format what's being dragged, so the drag ghost exactly reflects what will be dropped
    dragSources = $('.sel')
    dragGhost = $('<div class="dragghost">')
    let clones = dragSources.clone()
    let row = $('<row class="hilite">')
    clones.each(function(i, el) {
      let clone = clones[i]
      if (clone.tagName === 'TAG' || clone.tagName === 'TXT') {
        //Flus what's been gathered so far and start a new row
        dragGhost.append(row)
        row = $('<row class="hilite">')
      }
      row.append(clone)
    });
    dragGhost.append(row)
    $('doc').after(dragGhost)

    dragSources.addClass('dragsource')
  }, 220)
}

function mousemove(e) {
  //Efficiency galore yay, but I want to determine the drop point based on where the mouse is on a dropzone

  clearTimeout(dragTimer)
  let target = $(e.target)
  if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}
  dropTarget = target

  //paint a selection or drag, based on how long mouse was down before move
  if (dragging && droppables.includes(dropTarget[0].tagName)) {
    //TODO: determine drop target based on what's being dragged. If only props & values, then drop inside rows, if there's a tag or a txt there, drop between rows. Only one row in ghost could be only props, check for first item of row if only one row. If not only props, then drop between rows. Indentation handling?
    let hitbox = e.target.getBoundingClientRect()
    let centerX = hitbox.left + hitbox.width / 2
    let centerY = hitbox.top + hitbox.height / 2

    if (e.clientX < centerX) {
      dropTarget.addClass('dropbefore')
    } else {
      dropTarget.addClass('dropafter')
    }
  } else if (mouseIsDown && !dragging) {
    selTarget(e, ':add')
  }

}

function mouseup(e) {

  //e.preventDefault()
  clearTimeout(dragTimer)

  //TODO: if we got a click on an already selected element, should collapse selection to it, this might a be tricky one

  //TODO: check for shift/alt/ctrl/cmd, there should be a key that lets you clone elements
  if (dropTarget && dragging && droppables.includes(dropTarget[0].tagName)) {
    if (dropTarget.hasClass('dropafter')) {
      dropTarget.after(dragSources)
    } else if (dropTarget.hasClass('dropbefore')) {
      dropTarget.before(dragSources)
    }
  }

  if (dragSources) {dragSources.removeClass('dragsource')}
  if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}

  dropTarget = null
  dragSources = null
  if (dragGhost) {dragGhost.remove()}
  dragGhost = null
  mouseIsDown = false
  dragging = false
  HI.popScope('dragging')
  HI.popScope('paintselection')
}


