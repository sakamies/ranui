let dragTimer
let mouseIsDown = false
let dragging = false
let dragSources = null
let dragGhost = null
let droppables = ['ROW','TAG','PROP','VAL','TXT']
let dropTarget = null
let dragMode = ''

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

    //Format what's being dragged, so the drag ghost exactly reflects what will be dropped. Dragging gathers all selected items and puts them in flat rows.
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
    })

    dragGhost.append(row)

    //TODO: determine drop target based on what's being dragged. If only props & values, then drop inside rows, if there's a tag or a txt there, drop between rows. Only one row in ghost could be only props, check for first item of row if only one row. If not only props, then drop between rows.
    dragMode = ':props'
    // if (false) {dragMode = ':props'}
    // else (false) {dragMode = ':rows'}

    $('doc').after(dragGhost)

    dragSources.addClass('dragsource')
  }, 220)
}

function mousemove(e) {
  clearTimeout(dragTimer)
  if (dragging) {
    if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}

    //What a crazy contraption, is there a simpler way to do this?
    if (dragMode === ':props') {
      if (['PROP','VAL'].includes(e.target.tagName)) {
        dropTarget = $(e.target)
        let hitbox = e.target.getBoundingClientRect()
        let centerX = hitbox.left + hitbox.width / 2
        let centerY = hitbox.top + hitbox.height / 2
        if (e.clientX < centerX) {
          dropTarget.addClass('dropbefore')
        } else {
          dropTarget.addClass('dropafter')
        }
      } else if (e.target.tagName === 'TAG') {
        dropTarget = $(e.target)
        dropTarget.addClass('dropafter')
      } else if (e.target.tagName === 'ROW') {
        //TODO: ignore text rows here
        console.log('over row')
        let target = $(e.target)
        let children = target.children()

        let first = children.eq(0)
        let hitFirst = first[0].getBoundingClientRect()
        let hitLeft = hitFirst.left + hitFirst.width

        let last = children.last()
        let hitLast = last[0].getBoundingClientRect()
        let hitRight = hitLast.left + hitLast.width
        console.log(children, last)

        if (e.clientX < hitLeft) {
          dropTarget = first
          dropTarget.addClass('dropafter')
        } else if (e.clientX > hitRight) {
          dropTarget = last
          dropTarget.addClass('dropafter')
        }
      }
    }
    else if (dragMode === ':rows') {
      if (e.target.tagName === 'ROW') {
        //dingi
      }
    }
  } else if (mouseIsDown && !dragging) {
    //Paint selection if mouse was moved before drag was initiated
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


