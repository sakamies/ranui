//NOTE: ranui.js is in global scope, so anything required here will be available through all scripts. Yeah, should be encapsulated and all that.

const electron = require('electron')
const {ipcRenderer} = electron;
const autofill = require.main.require('./js/autofill.js')
const tags = require.main.require('./js/tags.js') //list of html tags

//TODO: Don't really need humaninput, I think, could replace all keyboard stuff with one keyboard catch event and check inputs myself. Humaninput implements keyboard combos wrong anyway. In cmd/alt/shift presses, it checks if a key has been pressed, not if it is down. So if you come into the app with the cmd key pressed down, it won't know it's down until you release it and press it down again. I think I did it pretty right in potato
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
HI.on('editing:input', e=>input(e.target))
HI.on('editing:backspace', autofill.prevent)
HI.on('editing:delete', autofill.prevent)
HI.on('editing:blur', commitEdit)
HI.on('editing:tab', e=>{commitEdit();tab(e)})
HI.on('editing:shift->tab', e=>{commitEdit();tab(e)})

HI.on('backspace', e=>del(e, ':backward'))
HI.on('delete', e=>del(e, ':forward'))
HI.on('cmd-d', e=>duplicate(e))

HI.on('beforecut', e=>{ HI.log.info('cut') })
HI.on('beforecopy', e=>{ HI.log.info('copy') })
HI.on('beforepaste', e=>{ HI.log.info('paste') })

HI.on('tab', e=>tab(e))
HI.on('shift->tab', e=>tab(e))


//Crazy editing
HI.on('space', createRow) //Next text row
HI.on('abcdefghijklmnopqrstuvwxyz'.split(''), createRow) //New tag row

HI.on('shift->enter', e=>createProp(e, ':prop:val'))
HI.on(',', e=>createProp(e, ':prop'))
HI.on([':','='], e=>createProp(e, ':val'))
HI.on('#', e=>createProp(e, ':id'))
HI.on('.', e=>createProp(e, ':class'))

//TODO: moving the selection needs to skip folded stuff
HI.on('-', e=>fold(e, ':fold'))
HI.on('+', e=>fold(e, ':unfold'))
HI.on('cmd-7', e=>comment(e))

HI.on('ctrl+up', e=>{HI.log.info('move up')})
HI.on('ctrl+down', e=>{HI.log.info('move up')})
HI.on('ctrl+left', e=>{HI.log.info('move left')})
HI.on('ctrl+right', e=>{HI.log.info('move right')})


//Mouse
//TODO: these need to be cancelled if scope is 'editing'
window.addEventListener('dblclick', e=>{history.update();startEdit(e)})
window.addEventListener('mousedown', e=>mouseDown(e))
window.addEventListener('mousemove', throttle(mouseMove, 16)) //Only running mousemove at max 60fps
window.addEventListener('mouseup', e=>mouseUp(e))
HI.on('dragging:escape', e=>cancelDrag(e))


//Undo Redo
//TODO: set history to work with ipc events from app menus instead of browserwindow keyboard events
let history = new History()
HI.on('keydown', e=>history.keydown(e))


//Files
HI.on('cmd->n', (event) => { HI.log.info('new') })
HI.on('cmd->o', (event) => { HI.log.info('open') })
HI.on('cmd->s', (event) => { HI.log.info('save') })
HI.on('cmd->shift->s', (event) => { HI.log.info('save as') })
HI.on('cmd->w', (event) => { HI.log.info('close') })
