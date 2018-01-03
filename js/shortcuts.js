let echoplay = new EchoPlay()

/* KEYBOARD SHORTCUTS for EchoPlay */
const MAESTRO_SHORTCUTS = {
  "alt+a": function() { echoplay.setRootNote('A') },
  "alt+b": function() { echoplay.setRootNote('B') },
  "alt+c": function() { echoplay.setRootNote('C') },
  "alt+d": function() { echoplay.setRootNote('D') },
  "alt+e": function() { echoplay.setRootNote('E') },
  "alt+f": function() { echoplay.setRootNote('F') },
  "alt+g": function() { echoplay.setRootNote('G') },
  "alt+right": function() {
    if (echoplay.jam.global.rootNote == 'B'){
      echoplay.setRootOctave(echoplay.jam.local.rootOctave+1)
    }
    echoplay.setRootNote(SHARPS[(SHARPS.indexOf(echoplay.jam.global.rootNote)+1)%SHARPS.length])
  },
  "alt+left": function() {
    let nextNote

    if (echoplay.jam.global.rootNote == 'C'){
      echoplay.setRootOctave(echoplay.jam.local.rootOctave-1)
      nextNote = 'B'
    }
    else{ nextNote = SHARPS[(SHARPS.indexOf(echoplay.jam.global.rootNote)-1)%SHARPS.length] }
    echoplay.setRootNote(nextNote)
  },
  "alt+r k": function() { echoplay.setRootNote(SHARPS[Math.floor(Math.random() * 12)]) }, // random root note
  "alt+up": function() { echoplay.setRootOctave(echoplay.jam.local.rootOctave+1, true) },
  "alt+down": function() { echoplay.setRootOctave(echoplay.jam.local.rootOctave-1, true) },
  "alt+shift+up": function() { echoplay.setOctaveRange(echoplay.jam.local.octaveRange+1, true) },
  "alt+shift+down": function() { echoplay.setOctaveRange(echoplay.jam.local.octaveRange-1, true) },
  "alt+shift+right": function() {
    let nextScale = Object.keys(SCALES)[(Object.keys(SCALES).indexOf(echoplay.jam.global.scale)+1) % Object.keys(SCALES).length]
    echoplay.setScale(nextScale)
  },
  "alt+shift+left": function() {
    let scales = Object.keys(SCALES)
    let nextScale
    if (echoplay.jam.global.scale == scales[0]){
      nextScale = scales[scales.length-1]
    }
    else{
      nextScale = scales[(scales.indexOf(echoplay.jam.global.scale)-1)%scales.length]
    }
    echoplay.setScale(nextScale)
  },
  "alt+r s": function() { // random scale
    echoplay.setScale(Object.keys(SCALES)[Math.floor(Math.random() * Object.keys(SCALES).length)])
  },
  "alt+0": function() { echoplay.setScale("chromatic") },
  "alt+1": function() { echoplay.setScale("major") },
  "alt+2": function() { echoplay.setScale("minor") },
  "alt+3": function() { echoplay.setScale("minor_harmonic") },
  "alt+4": function() { echoplay.setScale("gipsy") },
  "alt+5": function() { echoplay.setScale("pentatonic") },
  "alt+6": function() { echoplay.setScale("minor_melodic_asc") },
  "alt+7": function() { echoplay.setScale("minor_melodic_desc") },
  "alt+8": function() { echoplay.setScale("octatonic") },
  "alt+n": function() { if(echoplay.jam.local.maestro) echoplay.socket.emit("show_note_names", true) },
  "alt+shift+n": function() { if(echoplay.jam.local.maestro) echoplay.socket.emit("show_note_names", false) },
}

const LOCAL_SHORTCUTS = {
  "meta+up": function() { echoplay.setRootOctave(echoplay.jam.local.rootOctave+1) },
  "meta+down": function() { echoplay.setRootOctave(echoplay.jam.local.rootOctave-1) },
  "meta+shift+up": function() { echoplay.setOctaveRange(echoplay.jam.local.octaveRange+1) },
  "meta+shift+down": function() { echoplay.setOctaveRange(echoplay.jam.local.octaveRange-1) },
  "mod+.": function() { echoplay.interface.instrument.volumeUp() },
  "mod+,": function() { echoplay.interface.instrument.volumeDown() },
  "mod+p": function() { echoplay.jam.local.playRemote = true },
  "mod+shift+p": function() { echoplay.jam.local.playRemote = false },
  "f1": function() { toggleFullScreen() },
}

Mousetrap.bind(LOCAL_SHORTCUTS)
if (echoplay.jam.local.maestro === true) Mousetrap.bind(MAESTRO_SHORTCUTS)
