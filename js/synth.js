// Set to fastest latency setting
Tone.context.latencyHint = "fastest";

//create a synth and connect it to the master output (your speakers)
var synthOptions = {
  oscillator: {
    type: "sine"
  },
  envelope  : {
    attack: 0.05,
    decay: 0.2,
    sustain: 0.8,
    release  : 0.1
  }
}

var synth = new Tone.Synth(synthOptions)
synth.toMaster()
