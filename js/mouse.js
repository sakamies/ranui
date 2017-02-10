'use strict'

let dragTimer
let mouseDownEvent = null
let dragGhost = $('<div class="dragghost">')
let dropTarget = null
let dragMode = ''
let mouseStart = ''

function mouseDown(e) {
  //Allow mouse to function according to platform defaults when editing text, also this way there's no need to worry about editing mode for the rest of this function & other mouse events.
  if (e.target.isContentEditable === true) {
    return true
  } else if (scope === 'editing') {
    commitEdit()
  }

  //e.preventDefault()
  let target = $(e.target)
  mouseDownEvent = e
  scope = 'paintselection'

  if (!target.hasClass('sel') && !target.hasClass('hilite')) {
    selTarget(e)
  }

  dragTimer = setTimeout(()=>{
    history.update()
    scope = 'dragging'

    //Format what's being dragged, so the drag ghost exactly reflects what will be dropped.
    //Dragging gathers all selected items and puts them in flat rows.
    let dragSourceRows = $('.hilite')
    //TODO: this could be made more efficient, seems wasteful
    dragSourceRows = dragSourceRows.add($('.hilite.folded').nextUntil('row:not(.hidden)')) //If you fold a row and drag it, its children will come with the drag
    let dragSourceProps = $('row:not(.hilite) .sel')
    let dragPayloadRows = dragSourceRows.clone()
    let dragPayloadProps = dragSourceProps.clone()
    dragSourceRows.addClass('dragsource')
    dragSourceProps.addClass('dragsource')

    //This allows nonsensical prop/row combinations, combining props with a txt row, but css will mark it as an error and the user needs to correct it. Should make this foolproof somehow.
    if (dragPayloadRows.length) {
      dragMode += ':rows'
      //TODO: this should not flatten tabs, needs some sort of smart autoindentation behaviour. This flattening would also mess up folded rows.
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
    })
    $('doc').after(dragGhost)

  }, 220)
}

function mouseMove(e) {
  clearTimeout(dragTimer)
  if (scope == 'paintselection') {
    //Paint selection if mouse was moved before drag was initiated
    selTarget(e, ':add')
  } else if (scope === 'dragging') {
    //Make dragGhost follow mouse
    dragGhost.css({
      'left': e.pageX + 'px',
      'top': e.pageY + 'px',
    })


    if (dropTarget) {
      dropTarget.removeClass('dropbefore dropafter')
      dropTarget = null
    }
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
        //This if case needs to be here in case the props are dragged more left or right than any props, so the dragmode is props mut cursor is on row
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
      } else {
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

      if (dropTarget && e.clientY < centerY) {
        dropTarget.addClass('dropbefore')
      } else if (dropTarget && e.clientY >= centerY) {
        dropTarget.addClass('dropafter')
      }

    }
  }
}

function mouseUp(e) {
  //e.preventDefault()
  clearTimeout(dragTimer)

  //TODO: check for shift/alt/ctrl/cmd, there should be a key that lets you clone elements
  let dragSource = $('.dragsource')

  if (scope === 'dragging' && dropTarget) {
    let dragPayload = dragGhost.children()
    //Set tabs according to droptarget tabs. This means that dragging does not preserve hierarchy in any way. It probably should preserve hierarchies where there's only an element and its children selected
    //dragPayload.attr('tabs', dropTarget.attr('tabs'))
    if (dropTarget.hasClass('dropafter')) {
      dropTarget.after(dragPayload)
    } else if (dropTarget.hasClass('dropbefore')) {
      dropTarget.before(dragPayload)
    }
    dragSource.remove()

    //At this poin the operation happened, add entry to history. The rest of mouseup is just cleanup
    history.add()
  } else if (scope === 'paintselection' && mouseDownEvent.screenX === e.screenX && mouseDownEvent.screenY === e.screenY) {
    //If you just click on an item and don't do a lasso selection or drag, then select the item
    selTarget(e)
  }

  if (dropTarget) {dropTarget.removeClass('dropbefore dropafter')}
  dropTarget = null
  if (dragSource) {dragSource.removeClass('dragsource')}
  dragGhost.css('display', 'none').empty()

  dragMode = ''
  mouseDownEvent = null
  if (scope === 'dragging' || scope === 'paintselection') {
    scope = '' //only reset scopes we have set in mouse.js, leave any other scopes alone
  }
}


function cancelDrag(e) {
  e.preventDefault()
  if (scope === 'dragging' || scope === 'paintselection') {
    scope = '' //only reset scopes we have set in mouse.js, leave any other scopes alone
  }
  mouseUp(e)
}
