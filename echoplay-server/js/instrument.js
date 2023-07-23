class Instrument{
  constructor(presetName, socket, local){
    this.local = local || false
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

  triggerAttack(note, trigger = true, retrigger = false, velocity = undefined){
    if (this.inst){
      if (this.polyphony == 1){
        if (this.triggeredNotes.length > 0 || trigger === true){
          this.inst.triggerAttack(note, null, velocity)
          if (this.triggeredNotes.indexOf(note) == -1 && retrigger == false) this.triggeredNotes.push(note)
          if (this.local === true) this.socket.emit("note_on", note)
        }
      } else {
        if (trigger === true || (retrigger === true && this.triggeredNotes.length > 0)){
          if (retrigger !== true) this.triggeredNotes.push(note)
          this.inst.triggerAttack(note, null, velocity)
          if (this.local === true) this.socket.emit("note_on", note)
        }
      }
    }
  }

  triggerRelease(note){
    if (this.inst){
      if (this.monophonic == true){
        this.triggeredNotes.remove(note)
        if (this.triggeredNotes.length == 0) this.inst.triggerRelease()
        else { this.triggerAttack(this.triggeredNotes.last()) }
      } else {
        if (this.triggeredNotes.length > 0) this.triggeredNotes.remove(note)
        this.inst.triggerRelease(note)
      }
      if (this.local === true) this.socket.emit("note_off", note)
    }
  }

  releaseAll(){
    if (this.inst){
      if (this.monophonic == true) this.inst.triggerRelease()
      else this.inst.releaseAll()
      this.triggeredNotes.length = 0
      if (this.local === true) this.socket.emit("release_all")
    }
  }

  noteLeave(note){
    if (this.inst){
      if (this.monophonic == false) this.inst.triggerRelease(note)
      if (this.local === true) this.socket.emit("note_off", note)
    }
  }

  setVolume(volume){
    if (typeof(volume)!="number" || volume > 0) return
    this.inst.volume.value = volume
  }

  volumeUp(){
    this.setVolume(this.inst.volume.value + 1)
  }

  volumeDown(){
    this.setVolume(this.inst.volume.value - 1)
  }
}
