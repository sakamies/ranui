window.HI = new HumanInput(window, {
  //noKeyRepeat: false,
  //logLevel: 'DEBUG',
})

//Selection
//Selection should be row by row or by tree, maybe based on some setting?
HI.on(['up', 'shift->up', 'cmd->up', 'cmd-shift->up'], e=>selRow(e, 'up'))
HI.on(['down', 'shift->down', 'cmd->down', 'cmd-shift->down'], e=>selRow(e, 'down'))

HI.on(['left', 'shift->left', 'cmd->left', 'cmd-shift->left'], e=>selCol(e, 'left'))
HI.on(['right', 'shift->right', 'cmd->right', 'cmd-shift->right'], e=>selCol(e, 'right'))

HI.on('escape', selEscape)

HI.on('osleft->d', selSimilar)

HI.on('click', selTarget)
//HI.on('pointer:left:down->pointermove', (event) => { HI.log.info('select a range') })
//HI.on('hold:500:pointer:left->pointermove', (event) => { HI.log.info('grab & move selected stuff') })


//Basic Editing
HI.on('enter', startEdit)
HI.on('editing:enter', commitEdit)
HI.on('editing:escape', commitEdit)
HI.on('editing:input', input)
HI.on('editing:blur', commitEdit)

HI.on('doubleclick', (event) => { HI.log.info('doubleclick doesnt work edit') })
//HI.on('escape', (event) => { HI.log.info('esc?') })
HI.on('backspace', (event) => { HI.log.info('delete sel and move sel backward') })
HI.on('delete', (event) => { HI.log.info('delete sel and move sel forward') })

HI.on('beforecut', (event) => { HI.log.info('cut') })
HI.on('beforecopy', (event) => { HI.log.info('copy') })
HI.on('beforepaste', (event) => { HI.log.info('paste') })

HI.on('tab', tab)
HI.on('shift->tab', tab)


//Crazy editing
HI.on('space', create)
HI.on('abcdefghijklmnopqrstuvwxyz'.split(''), create)

HI.on(',', (event) => { HI.log.info('add property') })
HI.on('alt->,', (event) => { HI.log.info('add value') })
HI.on('#', (event) => { HI.log.info('add id prop and empty value, focus on value') })
HI.on('.', (event) => { HI.log.info('add class prop and empty value, focus on value') })
HI.on('+', (event) => { HI.log.info('unfold') })
HI.on('-', (event) => { HI.log.info('fold') })
HI.on('cmd->/', (event) => { HI.log.info('toggle comment') })
//move up
//move down
//move left
//move right


//Undo Redo
//Should be handled on the app level so menus and all would work
let history = new History()
HI.on('keydown', e=>history.keydown(e))
//HI.on('cmd->z', e=>{history.undo();return false})
//HI.on('cmd->shift->z', e=>history.redo())
//HI.on('shift->cmd->z', e=>history.redo())


//Files
HI.on('cmd->n', (event) => { HI.log.info('new') })
HI.on('cmd->o', (event) => { HI.log.info('open') })
HI.on('cmd->s', (event) => { HI.log.info('save') })
HI.on('cmd->shift->s', (event) => { HI.log.info('save as') })
HI.on('cmd->w', (event) => { HI.log.info('close') })
