let dragTimer
let mouseIsDown = false
let dragging = false
let dragGhost = $('<div class="dragghost">')
let dropTarget = null
let dragMode = ''

//TODO: add undo support here
//TODO: esc should cancel the operation

function mousedown(e) {
  //Allow mouse to function according to platform defaults when editing text, also this way there's no need to worry about editing mode for the rest of this function & other mouse events.
  if (e.target.contenteditable === true) {return}
  else if (HI.scope ==='editing:') {commitEdit()}

  e.preventDefault()
  let target = $(e.target)
  mouseIsDown = e.target
  HI.pushScope('paintselection')

  if (!target.hasClass('sel') && !target.hasClass('hilite')) {
    selTarget(e)
  }

  dragTimer = setTimeout(()=>{
    HI.popScope('paintselection')
    HI.pushScope('dragging')
    dragging = true

    //Format what's being dragged, so the drag ghost exactly reflects what will be dropped. Dragging gathers all selected items and puts them in flat rows.
    let dragSourceRows = $('.hilite')
    let dragSourceProps = $('row:not(.hilite) .sel')
    let dragPayloadRows = dragSourceRows.clone()
    let dragPayloadProps = dragSourceProps.clone()
    dragSourceRows.addClass('dragsource')
    dragSourceProps.addClass('dragsource')

    if (dragPayloadRows.length) {
      dragMode += ':rows'
      //TODO: need to handle the situation when there's only props & txt row selected
      dragPayloadRows.children().first().after(dragPayloadProps)
      dragGhost.append(dragPayloadRows)
    } else if (dragPayloadProps.length) {
      dragMode += ':props'
      dragGhost.append(dragPayloadProps)
    }

    dragGhost.css({
      'display': 'inline-block',
      'left': e.pageX + 'px',
      'top': e.pageY + 'px',
    });
    $('doc').after(dragGhost)

  }, 220)
}

function mousemove(e) {
  clearTimeout(dragTimer)
  if (mouseIsDown && !dragging) {
    //Paint selection if mouse was moved before drag was initiated
    selTarget(e, ':add')
  } else if (dragging) {
    //Make dragGhost follow mouse
    dragGhost.css({
      'left': e.pageX + 'px',
      'top': e.pageY + 'px',
    });


    if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}
    let target = $(e.target)

    //What a crazy contraption, is there a simpler way to do this?
    if (dragMode.includes(':props')) {
      if (['PROP','VAL'].includes(e.target.tagName)) {
        dropTarget = target
        let hitbox = e.target.getBoundingClientRect()
        let centerX = hitbox.left + hitbox.width / 2
        let centerY = hitbox.top + hitbox.height / 2
        if (e.clientX < centerX) {
          dropTarget.addClass('dropbefore')
        } else {
          dropTarget.addClass('dropafter')
        }
      } else if (e.target.tagName === 'TAG') {
        dropTarget = target
        dropTarget.addClass('dropafter')
      } else if (e.target.tagName === 'ROW' && target.attr('type') !== 'txt') {
        let children = target.children()

        let first = children.eq(0)
        let hitFirst = first[0].getBoundingClientRect()
        let hitLeft = hitFirst.left + hitFirst.width

        let last = children.last()
        let hitLast = last[0].getBoundingClientRect()
        let hitRight = hitLast.left + hitLast.width

        if (e.clientX < hitLeft) {
          dropTarget = first
          dropTarget.addClass('dropafter')
        } else if (e.clientX > hitRight) {
          dropTarget = last
          dropTarget.addClass('dropafter')
        }
      }
    }
    else if (dragMode.includes(':rows')) {
      let hitbox = e.target.getBoundingClientRect()
      let centerY = hitbox.top + hitbox.height / 2
      let toTop = false
      let toBottom = false

      if (['TAG','PROP','VAL','TXT'].includes(e.target.tagName)) {
        dropTarget = target.parent()
      } else if (e.target.tagName === 'ROW') {
        dropTarget = target
      }

      if (e.clientY < centerY) {
        dropTarget.addClass('dropbefore')
      } else if (e.clientY > centerY) {
        dropTarget.addClass('dropafter')
      }

    }
  }
}

function mouseup(e) {
  //e.preventDefault()
  clearTimeout(dragTimer)

  //TODO: check for shift/alt/ctrl/cmd, there should be a key that lets you clone elements
  let dragSource = $('.dragsource')

  if (dragging && dropTarget) {
    let dragPayload = dragGhost.children()
    //TODO: calculate tabs?
    if (dropTarget.hasClass('dropafter')) {
      dropTarget.after(dragPayload)
    } else if (dropTarget.hasClass('dropbefore')) {
      dropTarget.before(dragPayload)
    }
    dragSource.remove()
  } else if (!dragging && e.target === mouseIsDown) {
    //TODO: this if should be based on mouse coordinates and not the target node, you could paint select your way through the document and end up in the same target node
    //If you just click on an item and don't do a lasso selection or drag, then select the item
    selTarget(e)
  }

  if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}
  dropTarget = null
  if (dragSource) {dragSource.removeClass('dragsource')}
  dragGhost.css('display', 'none').empty()

  dragMode = ''
  mouseIsDown = false
  dragging = false
  HI.popScope('dragging')
  HI.popScope('paintselection')
}


