/* Fastest latency on non mobile devices */
if (!isMobile()) Tone.context.latencyHint = "fastest";

/* Initial local jam settings */

let jamSettings = {
  local: {
    maestro: true,
    rootOctave: 3,
    octaveRange: 2,
    instrumentPreset: "poly_sine",
    playRemote: true,
  }
}
let instrument = new Object()

/* Colors */

function makeColorPalette(frequency,
                           center, width, len)
{
  function RGB2Color(r,g,b)
  {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
  }
  function byte2Hex(n)
  {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
  }

  if (frequency == undefined) frequency = .3;
  if (center == undefined)   center = 128;
  if (width == undefined)    width = 127;
  if (len == undefined)      len = 12;

  let palette = new Array()
  for (var i = 0; i < len; ++i)
  {
     var red = Math.sin(frequency*i + 0) * width + center;
     var grn = Math.sin(frequency*i + 2) * width + center;
     var blu = Math.sin(frequency*i + 4) * width + center;
     palette.push(RGB2Color(red,grn,blu));
  }
  return palette
}

// Default color palette (12 colors)
let colorPalette = makeColorPalette(0.52, 128, 127, 12)

/* KEYBOARD SHORTCUTS */

const MAESTRO_SHORTCUTS = {
  "alt+a": function() { setRootNote('A') },
  "alt+b": function() { setRootNote('B') },
  "alt+c": function() { setRootNote('C') },
  "alt+d": function() { setRootNote('D') },
  "alt+e": function() { setRootNote('E') },
  "alt+f": function() { setRootNote('F') },
  "alt+g": function() { setRootNote('G') },
  "alt+right": function() {
    if (jamSettings.global.rootNote == 'B'){
      setRootOctave(jamSettings.local.rootOctave+1)
    }
    setRootNote(SHARPS[(SHARPS.indexOf(jamSettings.global.rootNote)+1)%SHARPS.length])
  },
  "alt+left": function() {
    let nextNote

    if (jamSettings.global.rootNote == 'C'){
      setRootOctave(jamSettings.local.rootOctave-1)
      nextNote = 'B'
    }
    else{ nextNote = SHARPS[(SHARPS.indexOf(jamSettings.global.rootNote)-1)%SHARPS.length] }
    setRootNote(nextNote)
  },
  "alt+r k": function() { setRootNote(SHARPS[Math.floor(Math.random() * 12)]) }, // random root note
  "alt+up": function() { setRootOctave(jamSettings.local.rootOctave+1, true) },
  "alt+down": function() { setRootOctave(jamSettings.local.rootOctave-1, true) },
  "alt+shift+up": function() { setOctaveRange(jamSettings.local.octaveRange+1, true) },
  "alt+shift+down": function() { setOctaveRange(jamSettings.local.octaveRange-1, true) },
  "alt+shift+right": function() {
    let nextScale = Object.keys(SCALES)[(Object.keys(SCALES).indexOf(jamSettings.global.scale)+1) % Object.keys(SCALES).length]
    setScale(nextScale)
  },
  "alt+shift+left": function() {
    let scales = Object.keys(SCALES)
    let nextScale
    if (jamSettings.global.scale == scales[0]){
      nextScale = scales[scales.length-1]
    }
    else{
      nextScale = scales[(scales.indexOf(jamSettings.global.scale)-1)%scales.length]
    }
    setScale(nextScale)
  },
  "alt+r s": function() { // random scale
    setScale(Object.keys(SCALES)[Math.floor(Math.random() * Object.keys(SCALES).length)])
  },
  "alt+0": function() { setScale("chromatic") },
  "alt+1": function() { setScale("major") },
  "alt+2": function() { setScale("minor") },
  "alt+3": function() { setScale("minor_harmonic") },
  "alt+4": function() { setScale("gipsy") },
  "alt+5": function() { setScale("pentatonic") },
  "alt+6": function() { setScale("minor_melodic_asc") },
  "alt+7": function() { setScale("minor_melodic_desc") },
  "alt+8": function() { setScale("octatonic") },
  "alt+n": function() { if(jamSettings.local.maestro) socket.emit("show_note_names", true) },
  "alt+shift+n": function() { if(jamSettings.local.maestro) socket.emit("show_note_names", false) },
}

const LOCAL_SHORTCUTS = {
  "meta+up": function() { setRootOctave(jamSettings.local.rootOctave+1) },
  "meta+down": function() { setRootOctave(jamSettings.local.rootOctave-1) },
  "meta+shift+up": function() { setOctaveRange(jamSettings.local.octaveRange+1) },
  "meta+shift+down": function() { setOctaveRange(jamSettings.local.octaveRange-1) },
  "mod+.": function() { volumeUp() },
  "mod+,": function() { volumeDown() },
  "mod+p": function() { jamSettings.local.playRemote = true },
  "mod+shift+p": function() { jamSettings.local.playRemote = false },
  "f1": function() { toggleFullScreen() },
}

if (isElectron()){
  const { remote } = require('electron');
  Mousetrap.bind("f12", () => { remote.getCurrentWindow().toggleDevTools() })
}

Mousetrap.bind(LOCAL_SHORTCUTS)
if (jamSettings.local.maestro === true) Mousetrap.bind(MAESTRO_SHORTCUTS)

/* LOCAL SETTINGS */

function setRootOctave(rootOctave, share=false, mute=false){
  jamSettings.local.rootOctave = rootOctave
  buildInterface(jamSettings)
  if (share === true && jamSettings.local.maestro === true) socket.emit("share_locals", jamSettings.local)
  instrument.triggerRoot(mute)
}

function setOctaveRange(octaveRange, share=false){
  if (typeof(octaveRange) != "number") return
  if (octaveRange < 1) octaveRange = 1
  else if (octaveRange > 10) octaveRange = 10
  jamSettings.local.octaveRange = octaveRange
  buildInterface(jamSettings)
  if (share === true && jamSettings.local.maestro === true) socket.emit("share_locals", jamSettings.local)
}

/* GLOBAL SETTINGS */

function setRootNote(rootNote, mute = false){
  if (NOTE_NAMES.indexOf(rootNote)==-1 || jamSettings.local.maestro !== true) return
  jamSettings.global.rootNote = rootNote
  socket.emit("update_jam", jamSettings.global)
  instrument.triggerRoot(mute)
}

function setScale(scaleName){
  if (Object.keys(SCALES).indexOf(scaleName) == -1 || jamSettings.local.maestro !== true) return
  jamSettings.global.scale = scaleName
  buildInterface(jamSettings)
  socket.emit("update_jam", jamSettings.global)
}

/* WINDOW CONTROL */

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

/* COMPUTER KEYBOARD TRIGGER */

const KEYS_PAD = [
  "z", "x", "c", "v", "b", "n", "m", ",",
  "a", "s", "d", "f", "g", "h", "j", "k",
  "w", "e", "r", "t", "y", "u", "i", "o",
  "2", "3", "4", "5", "6", "7", "8", "9"
]
