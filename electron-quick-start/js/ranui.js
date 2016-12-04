window.HI = new HumanInput(window, {
  noKeyRepeat: false,
  //logLevel: 'DEBUG',
})

//Selection
//Selection is row by row or by tree based on settings
HI.on('up', e=>HI.trigger('sel:row', 'up'))
HI.on('down', e=>HI.trigger('sel:row', 'down'))
HI.on('shift->up', e=>HI.trigger('sel:row', 'up:add'))
HI.on('shift->down', e=>HI.trigger('sel:row', 'down:add'))
HI.on('sel:row', selRow)

HI.on('left', e=>HI.trigger('sel:col', 'left'))
HI.on('right', e=>HI.trigger('sel:col', 'right'))
HI.on('shift->left', e=>HI.trigger('sel:col', 'left:add'))
HI.on('shift->right', e=>HI.trigger('sel:col', 'right:add'))
HI.on('sel:col', selCol)

HI.on('escape', selParent)

HI.on('cmd->d', e=>HI.trigger('sel:similar'))

HI.on('click', sel)
//HI.on('pointer:left:down->pointermove', (event) => { HI.log.info('select a range') })
//HI.on('hold:500:pointer:left->pointermove', (event) => { HI.log.info('grab & move selected stuff') })


//Basic Editing
HI.on('enter', startEdit)
HI.on('editing:enter', commitEdit)
HI.on('editing:escape', commitEdit)
HI.on('editing:input', edit)

HI.on('doubleclick', (event) => { HI.log.info('doubleclick edit') })
//HI.on('escape', (event) => { HI.log.info('esc?') })
HI.on('blur', (event) => { HI.log.info('commit edit on txt/el/prop/val blur') })
HI.on('backspace', (event) => { HI.log.info('delete sel and move sel backward') })
HI.on('delete', (event) => { HI.log.info('delete sel and move sel forward') })

HI.on('beforecut', (event) => { HI.log.info('cut') })
HI.on('beforecopy', (event) => { HI.log.info('copy') })
HI.on('beforepaste', (event) => { HI.log.info('paste') })

HI.on('tab', (event) => { HI.log.info('indent') })
HI.on('shift->tab', (event) => { HI.log.info('outdent') })


//Crazy editing
HI.on('keydown', (event) => { if (event.key.match(/^[a-zA-Z]$/)) {HI.log.info('new el')}}) //TODO: check that only a single key was pressed, no modifiers
HI.on('space', (event) => { HI.log.info('new textnode') })
HI.on(',', (event) => { HI.log.info('add property') })
HI.on('.', (event) => { HI.log.info('add value') })
HI.on('+', (event) => { HI.log.info('unfold') })
HI.on('-', (event) => { HI.log.info('fold') })
HI.on('cmd->/', (event) => { HI.log.info('toggle comment') })
//move up
//move down
//move left
//move right


//Undo Redo
HI.on('cmd->z', (event) => { HI.log.info('undo') })
HI.on('cmd-shift-z', (event) => { HI.log.info('redo') })
HI.on('shift->cmd->z', (event) => { HI.log.info('redo') })


//Files
HI.on('cmd->n', (event) => { HI.log.info('new') })
HI.on('cmd->o', (event) => { HI.log.info('open') })
HI.on('cmd->s', (event) => { HI.log.info('save') })
HI.on('cmd->shift->s', (event) => { HI.log.info('save as') })
HI.on('cmd->w', (event) => { HI.log.info('close') })
