class Instrument{
  constructor(socket, presetName){
    this.socket = socket
    this.triggeredNotes = new Array()
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
    }).then(() => {
      if (this.monophonic == true) this.inst = new this.instance(this.options)
      else{
        this.inst = new Tone.PolySynth(this.polyphony, this.instance)
        this.inst.set(this.options)
      }
      this.inst.toMaster()
    })
  }

  triggerAttack(note, trigger, retrigger, velocity){
    if (this.inst){
      if (this.polyphony == 1){
        if (this.triggeredNotes.length > 0 || trigger === true){
          this.inst.triggerAttack(note, null, velocity)
          this.socket.emit("note_on", note)
        }
        if (trigger === true) this.triggeredNotes.push(note)
      } else {
        if (trigger === true || (retrigger === true && this.triggeredNotes.length > 0)){
          if (retrigger !== true) this.triggeredNotes.push(note)
          this.inst.triggerAttack(note, null, velocity)
          this.socket.emit("note_on", note)
        }
      }
    }
  }

  triggerRelease(note){
    if (this.inst){
      if (this.monophonic == true){
        if (this.triggeredNotes.length > 0) this.triggeredNotes.length = 0
        if (this.triggeredNotes.length = 0) this.inst.triggerRelease()
      } else {
        if (this.triggeredNotes.length > 0) this.triggeredNotes.remove(note)
        this.inst.triggerRelease(note)
      }
      this.socket.emit("note_off", note)
    }
  }

  releaseAll(){
    if (this.inst){
      if (this.monophonic == true) this.inst.triggerRelease()
      else this.inst.releaseAll()
      this.triggeredNotes.length = 0
      this.socket.emit("release_all")
    }
  }

  noteLeave(note){
    if (this.inst){
      if (this.monophonic == false) this.inst.triggerRelease(note)
      this.socket.emit("note_off", note)
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
