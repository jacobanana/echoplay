// Set to fastest latency setting
if (!isMobile()) Tone.context.latencyHint = "fastest";

var instrument, instrumentData
//create a synth and connect it to the master output (your speakers)
function startInstrument(preset){
  $.getJSON('/instruments/'+preset+'.json', (data) => {
    instrument = data
    instrument.instance = eval(data.instance)
    instrument.triggeredNotes = 0

    if (instrument.polyphony == 1){
      instrument.inst = new instrument.instance(instrument.options)
      instrument.triggerAttack = function(note, trigger, retrigger, velocity){
        if (instrument.triggeredNotes > 0 || trigger === true){
          instrument.inst.triggerAttack(note, velocity)
          socket.emit("note_on", note)
        }
        if (trigger === true) instrument.triggeredNotes += 1
      }

      instrument.triggerRelease = function(note){
        if (instrument.triggeredNotes > 0) instrument.triggeredNotes -= 1
        if (instrument.triggeredNotes <= 0) instrument.inst.triggerRelease()
        socket.emit("note_off", note)
      }

      instrument.releaseAll = function(){
        instrument.inst.triggerRelease()
        instrument.triggeredNotes = 0
        socket.emit("release_all")
      }

      instrument.noteLeave = function(note){
        socket.emit("note_off", note)
      }
    }
    else{
      instrument.inst = new Tone.PolySynth(instrument.polyphony, instrument.instance)
      instrument.triggerAttack = function(note, trigger, retrigger, velocity){
        if (trigger === true || (retrigger === true && instrument.triggeredNotes > 0)){
          instrument.triggeredNotes += 1
          instrument.inst.triggerAttack(note, velocity)
          socket.emit("note_on", note)
        }
      }
      instrument.triggerRelease = function(note){
        if (instrument.triggeredNotes > 0) instrument.triggeredNotes -= 1
        instrument.noteLeave(note)
      }
      instrument.releaseAll = function(){
        instrument.inst.releaseAll()
        instrument.triggeredNotes = 0
        socket.emit("release_all")
      }

      instrument.noteLeave = function(note){
        instrument.inst.triggerRelease(note)
        socket.emit("note_off", note)
      }
    }

    instrument.inst.toMaster()
  })
}

startInstrument('poly')
