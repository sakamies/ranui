var HI = new HumanInput(window);

//Selection
//Selection is row by row or by tree based on settings
HI.on('up', (event) => { HI.log.info('sel up') });
HI.on('down', (event) => { HI.log.info('sel down') });
HI.on('left', (event) => { HI.log.info('sel left') });
HI.on('right', (event) => { HI.log.info('sel right') });
HI.on('shift->up', (event) => { HI.log.info('add sel up') });
HI.on('shift->down', (event) => { HI.log.info('add sel down') });
HI.on('shift->left', (event) => { HI.log.info('add sel left') });
HI.on('shift->right', (event) => { HI.log.info('add sel right') });
HI.on('click', (event) => { HI.log.info('click select') });
HI.on('shift->click', (event) => { HI.log.info('click add to selection') });

//Basic Editing
HI.on('enter', (event) => { HI.log.info('edit') });
HI.on('esc', (event) => { HI.log.info('escape editing or select parent') });
HI.on('backspace', (event) => { HI.log.info('delete sel and move sel backward') });
HI.on('delete', (event) => { HI.log.info('delete sel and move sel forward') });

HI.on('cmd->c', (event) => { HI.log.info('cut') });
HI.on('cmd->x', (event) => { HI.log.info('copy') });
HI.on('cmd->', (event) => { HI.log.info('paste') });

HI.on('tab', (event) => { HI.log.info('indent') });
HI.on('shift->tab', (event) => { HI.log.info('outdent') });


//Crazy editing
HI.on('keydown', (event) => { HI.log.info('new element') });
HI.on('space', (event) => { HI.log.info('new textnode') });
//move up, down, left right for rows & elements
//fold & unfold
//toggle comment
//add prop, add val

//Undo Redo
HI.on('cmd->z', (event) => { HI.log.info('undo') });
HI.on('cmd->shift->z', (event) => { HI.log.info('redo') });
HI.on('shift->cmd->z', (event) => { HI.log.info('redo') });

//Files
HI.on('cmd->n', (event) => { HI.log.info('new') });
HI.on('cmd->o', (event) => { HI.log.info('open') });
HI.on('cmd->s', (event) => { HI.log.info('save') });
HI.on('cmd->shift->s', (event) => { HI.log.info('save as') });
HI.on('cmd->w', (event) => { HI.log.info('close') });
