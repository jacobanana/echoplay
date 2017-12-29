// Web MIDI Access
//
var midi = null;  // global MIDIAccess object
var MIDIDevices = new Object;

function onMIDISuccess( midiAccess ) {
  midi = midiAccess;
  for (var entry of midi.inputs) {
    var input = entry[1];
    MIDIDevices[input.id] = input;
    MIDIDevices[input.id].onmidimessage = function(event){
      if (event.data[0] == 144){
        let note = NoteFromMidi(event.data[1])
        let velocity = event.data[2]/127
        console.log(note, velocity, event.data[2])
        if (event.data[2] == 0){
          echoplay.interface.noteOff(note, true)
        } else {
          echoplay.interface.noteOn(note, true, false, velocity)
        }
      }
    }
  }
}
function onMIDIFailure(msg) {
  console.log( "Failed to get MIDI access - " + msg );
}

navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
