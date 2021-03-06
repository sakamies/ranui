# Foolproof HTML editor prototype

The grand idea is to build a native html editor (so not a general text editor that's customized for html, but purpose built for only html) that can handle any html, even with random template code in the middle. Then hopefully expand the editing model to support css, then json and others.

I wrote a little article on the rationale here <https://pumpula.net/foolproof-html>

There's also this, more of a note to self type explainer on how the rows are handled. <https://pumpula.net/foolproof-html/how-the-data>

## Contributing

My prototype code is a mess, so we're trying to get some proper app arcitecture done. I set up a Gitter chat for planning and sharing stuff. The chat is the best way to contribute right now. https://gitter.im/flprf/Lobby

The prototype is good enough for demos, but not really usable yet. It's Mac only for now, mainly because doing good multi platform keyboard support would take time off from making it actually work. Contributions welcome!

## Running


1. Clone the repo
2. Run `npm install`
3. Run `npm start`


- Type lowercase to create elements
- Type uppercase to create text
- Press space to add attributes
- Press enter to edit what you have selected.

You can find most actions in js/keydown.js. Some actions come through the app shell from menu items, the ones you'd expect like undo/redo, saving (TODO), copy & paste etc. The interactions are modelled pretty closely after Sublime Text. I'm hoping to make the UI feel instantly familiar and productive to anyone who's ever written HTML in a text editor.

Probably needless to say, but expect buggy behaviour. Most stuff seems to be working fine, but that's just me using it.

Built with [Electron](http://electron.atom.io).
