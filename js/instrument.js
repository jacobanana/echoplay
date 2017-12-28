class Instrument{
  constructor(presetName){
    this.triggeredNotes = 0
    if (presetName){
      this.loadPreset(presetName)
    }
  }

  loadPreset(presetName){
    this.name = presetName
    this.filePath = 'instruments/'+presetName+'.json'
    $.getJSON(this.filePath, (data) => {
      this.instance = eval(data.instance)
      this.polyphony = data.polyphony
      if (this.polyphony == 1) this.monophonic = true
      else this.monophonic = false
      this.options = data.options
    }).then(() => this.setup())
  }

  setup(){
    if (this.monophonic == true) this.inst = new this.instance(this.options)
    else{
      this.inst = new Tone.PolySynth(this.polyphony, this.instance)
      this.inst.set(this.options)
    }
    this.inst.toMaster()
  }

  triggerRoot(){
    if (this.inst){
      this.inst.triggerAttackRelease(
        jamSettings.global.rootNote+(jamSettings.local.rootOctave).toString()
        , "16n"
      )
    }
  }

  triggerAttack(note, trigger, retrigger, velocity){
    if (this.inst){
      if (this.polyphony == 1){
        if (this.triggeredNotes > 0 || trigger === true){
          this.inst.triggerAttack(note, null, velocity)
          socket.emit("note_on", note)
        }
        if (trigger === true) this.triggeredNotes += 1
      } else {
        if (trigger === true || (retrigger === true && this.triggeredNotes > 0)){
          if (retrigger !== true) this.triggeredNotes += 1
          this.inst.triggerAttack(note, null, velocity)
          socket.emit("note_on", note)
        }
      }
    }
  }

  triggerRelease(note){
    if (this.inst){
      if (this.monophonic == true){
        if (this.triggeredNotes > 0) this.triggeredNotes -= 1
        if (this.triggeredNotes <= 0) this.inst.triggerRelease()
      } else {
        if (this.triggeredNotes > 0) this.triggeredNotes -= 1
        this.inst.triggerRelease(note)
      }
      socket.emit("note_off", note)
    }
  }

  releaseAll(){
    if (this.inst){
      if (this.monophonic == true) this.inst.triggerRelease()
      else this.inst.releaseAll()
      this.triggeredNotes = 0
      socket.emit("release_all")
    }
  }

  noteLeave(note){
    if (this.inst){
      if (this.monophonic == false) this.inst.triggerRelease(note)
      socket.emit("note_off", note)
    }
  }

  setVolume(volume){
    if (typeof(volume)!="number" || volume > 0) return
    this.inst.set({volume})
  }

  volumeUp(){
    this.setVolume(this.inst.volume.value + 1)
  }

  volumeDown(){
    this.setVolume(this.inst.volume.value - 1)
  }
}
