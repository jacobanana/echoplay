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

  frequency = frequency || 0.52
  center = center || 128
  width = width || 127
  len = len || 12

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

/* WINDOW CONTROL */
// if (isElectron()){
//   const { remote } = require('electron');
//   Mousetrap.bind("f12", () => { remote.getCurrentWindow().toggleDevTools() })
// }

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

const ACCESSIBLE_KEYS = {
  "space": "a",
  "enter": "d",
  "tab": "g",
  "shift+tab": "j",
  "backspace": "k"
}

const INSTRUMENTS = {
  //"Monophonic Sine": "mono_sine",
  //"Monophonic Simple Square": "mono_square",
  //"Monophonic Square Synth": "mono_synth_square",
  "Polyphonic Sine": "poly_sine",
  //"Polyphonic Square": "poly_square"
}

class EchoPlay{
  constructor(context, parent){
    this.context = context
    this.socket = io.connect()
    this.parent = parent || "#interface"
    this.jam = {
      local: {
        maestro: true,
        rootOctave: 3,
        octaveRange: 2,
        instrumentPreset: Object.values(INSTRUMENTS)[Math.floor(Math.random() * Object.values(INSTRUMENTS).length)],
      },
      global: {
        rootNote: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][Math.floor(Math.random() * 12)],
        scale: ["major", "minor", "minor_harmonic", "gipsy"][Math.floor(Math.random() * 4)],
        showNotes: true,
      }
    }
    this.players = new Object()
    this.socket.on('connect', () => {
      this.socket.emit("instrument_preset", this.jam.local.instrumentPreset)
      this.addPlayer(this.socket.id, this.socket, true, this.jam.local.instrumentPreset)
      this.interface = new PadsInterface(this.parent, this.socket, this.players, this.context)
      this.setupSocket()
      this.socket.emit("get_players")
    })
    this.displaySettings = false
  }

  setupSocket(){
    this.socket.on("url", (url) => {
      $("#url").text(url)
    })

    this.socket.on("new_jam", (globalJam) => {
      this.jam.global = globalJam
      this.render()
    })
    this.socket.on("share_locals", (localJam) => {
      this.jam.local = localJam
      this.render()
    })

    this.socket.on("players", (players, presets) => {
      console.log("players received")
      console.log(presets)
      players.forEach(player => {
        console.log("player:", player, presets[player])
        if (Object.keys(this.players).indexOf(player)==-1) {
          this.addPlayer(player, this.socket, false, presets[player])
        }
      })
      if (this.displaySettings == true) this.renderSettings()
    })

    this.socket.on("add_player", (player, preset) => {
      console.log("add player:", player, preset)
      this.addPlayer(player, this.socket, false, preset)
      if (this.displaySettings == true) this.renderSettings()
    })

    this.socket.on("remove_player", player => {
      console.log("remove player:", player)
      this.removePlayer(player)
      if (this.displaySettings == true) this.renderSettings()
    })

    this.socket.on("load_instrument", (id, preset) => {
      console.log("load_instrument", id, preset, id==this.socket.id)
      if (this.players[id]) {
        console.log("loading preset")
        this.players[id].instrument.loadPreset(preset)
      }
    })

    this.socket.emit("request_jam")
    this.interface.bindSockets()
  }

  toggleSettings(){
    this.displaySettings = !this.displaySettings
    this.render()
  }

  renderSettings(){
    $(this.parent).html("<div id='settings'> \
      <h1>Settings</h1> \
      <h2>Jammers</h2> \
      <div id='jammers'/> \
      <h2>We're jamming in:</h2> \
      <p>"+this.jam.global.rootNote+" "+this.jam.global.scale+"</p> \
    </div>")

    Object.keys(this.players).forEach(player => {
      $("#jammers").append(
        $("<div/>")
          .attr({"player_id": player})
          .click((e) => {
            this.players[player].play = !this.players[player].play
            if (this.players[player].play == true){
              $(e.target).css('color', '#00FF00')
            } else {
              $(e.target).css('color', '#FF0000')
            }
          })
          .text(player+" / "+this.players[player].instrument.name+" / "+this.players[player].play)
      )
    })
  }

  render(){
    if (this.displaySettings == true) this.renderSettings()
    else this.interface.setupJam(this.jam)
  }

  /* LOCAL SETTINGS */

  setRootOctave(rootOctave, share=false, mute=false){
    this.jam.local.rootOctave = rootOctave
    this.render()
    if (share === true && this.jam.local.maestro === true) {
      this.socket.emit("share_locals", this.jam.local)
    }
  }

  setOctaveRange(octaveRange, share=false){
    if (typeof(octaveRange) != "number") return
    if (octaveRange < 1) octaveRange = 1
    else if (octaveRange > 10) octaveRange = 10
    this.jam.local.octaveRange = octaveRange
    this.render()
    if (share === true && this.jam.local.maestro === true) {
      this.socket.emit("share_locals", this.jam.local)
    }
  }

  /* GLOBAL SETTINGS */
  setRootNote(rootNote, mute = false){
    if (NOTE_NAMES.indexOf(rootNote)==-1 || this.jam.local.maestro !== true) return
    this.jam.global.rootNote = rootNote
    this.socket.emit("update_jam", this.jam.global)
  }

  setScale(scaleName){
    if (Object.keys(SCALES).indexOf(scaleName) == -1 || this.jam.local.maestro !== true) return
    this.jam.global.scale = scaleName
    this.socket.emit("update_jam", this.jam.global)
  }

  addPlayer(id, socket, local, preset){
    socket = self.socket || socket
    local = local || false
    this.players[id] = {
      "instrument": new Instrument(preset, socket, local),
      "play": true
    }
    if (local === false) this.interface.addPlayer(id)
  }

  removePlayer(id){
    this.interface.removePlayer(id)
    try{ this.players[id].instrument.inst.dispose(); console.log("disposed of instrument "+id) } catch(e) { console.log(e) }
    delete this.players[id]
  }

}

$(function() {
  /* Fastest latency */
  Tone.context.latencyHint = "fastest";

  echoplay = new EchoPlay(Tone.context)

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
        echoplay.setRootOctave(echoplay.jam.local.rootOctave+1, true)
      }
      echoplay.setRootNote(SHARPS[(SHARPS.indexOf(echoplay.jam.global.rootNote)+1)%SHARPS.length])
    },
    "alt+left": function() {
      let nextNote

      if (echoplay.jam.global.rootNote == 'C'){
        echoplay.setRootOctave(echoplay.jam.local.rootOctave-1, true)
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
    "f1": function() { toggleFullScreen() },
  }

  Mousetrap.bind(LOCAL_SHORTCUTS)
  if (echoplay.jam.local.maestro === true) Mousetrap.bind(MAESTRO_SHORTCUTS)
  $("h1").on('click', function(){ echoplay.toggleSettings() })
  $("#jam").on('click', function(){ toggleFullScreen() })

})
