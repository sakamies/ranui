const electron = require('electron')
const {ipcRenderer} = electron;

//TODO: don't really need humaninput I think, could replace all keyboard stuff with one keyboard catch event and check inputs myself
window.HI = new HumanInput(window, {
  //noKeyRepeat: false,
  //logLevel: 'DEBUG',
})

//Selection
//Selection should be row by row or by tree, maybe based on some setting?
HI.on(['up', 'shift->up'], e=>selRow(e, 'up'))
HI.on(['down', 'shift->down'], e=>selRow(e, 'down'))

HI.on(['left', 'shift->left', 'cmd->left', 'cmd-shift->left'], e=>selCol(e, 'left'))
HI.on(['right', 'shift->right', 'cmd->right', 'cmd-shift->right'], e=>selCol(e, 'right'))

HI.on('escape', selEscape)

HI.on('osleft->d', selSimilar)


//Basic Editing
HI.on('enter', e=>{history.update();startEdit(e)})
HI.on('editing:enter', e=>commitEdit(e))
HI.on('editing:escape', e=>commitEdit(e))
HI.on('editing:input', input)
HI.on('editing:blur', commitEdit)


HI.on('backspace', e=>del(e, ':backward'))
HI.on('delete', e=>del(e, ':forward'))
//HI.on('cmd-shift-d', e=>duplicate(e))

HI.on('beforecut', e=>{ HI.log.info('cut') })
HI.on('beforecopy', e=>{ HI.log.info('copy') })
HI.on('beforepaste', e=>{ HI.log.info('paste') })

HI.on('tab', e=>tab(e))
HI.on('shift->tab', e=>tab(e))


//Crazy editing
HI.on('space', newRow) //Next text row
HI.on('abcdefghijklmnopqrstuvwxyz'.split(''), newRow) //New tag row

HI.on('shift->enter', e=>newProp(e, ':prop:val'))
HI.on(',', e=>newProp(e, ':prop'))
HI.on([':','='], e=>newProp(e, ':val'))
HI.on('#', e=>HI.log.info('add ID')/*newProp(e, ':id')*/)
HI.on('.', e=>{ HI.log.info('add class prop and empty value, focus on value') })

//TODO: moving the selection needs to skip folded stuff
HI.on('+', e=>{ HI.log.info('unfold') })
HI.on('-', e=>{ HI.log.info('fold') })
HI.on('cmd-7', e=>comment(e))

HI.on('ctrl+up', e=>{HI.log.info('move up')})
HI.on('ctrl+down', e=>{HI.log.info('move up')})
HI.on('ctrl+left', e=>{HI.log.info('move left')})
HI.on('ctrl+right', e=>{HI.log.info('move right')})


//Mouse
window.addEventListener('dblclick', e=>{history.update();startEdit(e)})
window.addEventListener('mousedown', e=>mouseDown(e))
window.addEventListener('mousemove', throttle(mouseMove, 16)) //Only running mousemove at max 60fps
window.addEventListener('mouseup', e=>mouseUp(e))
HI.on('dragging:escape', e=>cancelDrag(e))


//Undo Redo
//Should be handled on the app level so menus and all would work
let history = new History()
HI.on('keydown', e=>history.keydown(e))
//These events didn't work with HI, so history has it's own check for the keys
//HI.on('cmd->z', e=>history.undo())
//HI.on(['cmd->shift->z','shift->cmd->z'], e=>history.redo())


//Files
HI.on('cmd->n', (event) => { HI.log.info('new') })
HI.on('cmd->o', (event) => { HI.log.info('open') })
HI.on('cmd->s', (event) => { HI.log.info('save') })
HI.on('cmd->shift->s', (event) => { HI.log.info('save as') })
HI.on('cmd->w', (event) => { HI.log.info('close') })
