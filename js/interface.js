/* Scaled PAD like interface */
class Interface{
  constructor(parent, jam, socket){
    this.socket = socket
    this.id = "#"+socket.id
    this.parent = parent || "#interface"
    this.remoteInstruments = new Object()
    this.setPalette()
    if (jam) this.setupJam(jam)
  }

  buildAndBindAll(){
    this.build()
    this.bindMouseAndTouch()
    this.bindKeyboard()
  }

  setPalette(frequency, center, width, len){
    frequency = frequency || 0.52
    center = center || 128
    width = width || 127
    len = len || 12
    this.colorPalette = makeColorPalette(frequency, center, width, len)
  }

  setupJam(jam){
    this.jam = jam
    this.scaleIntervals = buildScale(this.jam.global.scale, this.jam.local.octaveRange)
    this.loadInstrument()
    this.buildAndBindAll()
  }

  /* Instrument & note triggers */
  loadInstrument(preset){
    preset = preset || this.jam.local.instrumentPreset
    this.instrument = new Instrument(this.socket, preset)
  }

  noteOn(note, trigger = true, retrigger = false, velocity = 1){
    if (this.instrument.polyphony == 1 || this.instrument.triggeredNotes.length < this.instrument.polyphony){
      if (this.instrument.triggeredNotes.length > 0 || trigger === true) $(this.id+" [note='"+note+"']").addClass("o-1")
      this.instrument.triggerAttack(note, trigger, retrigger, velocity)
    }
  }

  noteOff(note, force = false){
    let select = this.id+" > [note='"+note+"'] .o-1"
    if($(this.id+" [note='"+note+"'] .o-1").length > 0 || force == true){
      this.instrument.triggerRelease(note)
      $(this.id+" [note='"+note+"']").removeClass("o-1")
    }
  }

  noteLeave(note){
    this.instrument.noteLeave(note)
  }

  bindMouseAndTouch(){
    $(this.id+" [trigger=true]").on('pointerdown', (event) => {
      this.noteOn($(event.currentTarget).attr("note"))
    })
    $(this.id+" [trigger=true]").on('pointerup', (event) => {
      this.noteOff($(event.currentTarget).attr("note"))
    })

    $(this.id+" [trigger=true]").on('pointerenter', (event) => {
      this.noteOn($(event.currentTarget).attr("note"), false, true)
    })

    $(this.id+" [trigger=true]").on('pointerleave', (event) => {
      let note = $(event.currentTarget).attr("note")
      this.noteLeave(note)
      $(this.id+" [note='"+note+"']").removeClass("o-1")
    })

    // Safety all note off when releasing the pointer on the header bar
    $("#header").on('pointerup', () => {
      this.instrument.releaseAll()
      $(this.id+" [trigger=true]").removeClass("o-1")
    })
  }


  /* DISPLAY OTHER PLAYERS DATA */

  bindSockets(){
    // Receives note data from other players
    this.socket.on("note_on", data => {
      $(this.id+" [note='"+data.note+"'] > [client_id="+data.id+"]").addClass("o-1")
      if (this.jam.local.playRemote == true) this.remoteInstruments[data.id].inst.triggerAttack(data.note)
    })
    this.socket.on("note_off", data => {
      $(this.id+" [note='"+data.note+"'] > [client_id="+data.id+"]").removeClass("o-1")
      if (this.jam.local.playRemote == true) this.remoteInstruments[data.id].inst.triggerRelease(data.note)
    })
    this.socket.on("release_all", data => {
      $(this.id+" [trigger=true] > [client_id="+data.id+"]").removeClass("o-1")
    })

    // Refresh the full list of players
    this.socket.on("players", clients => {
      console.log("interface players")
      this.removeAllPlayers()
      clients.forEach(client => {
        if (client != this.socket.id) this.addPlayer(client)
      })
    })

    // Add a new player to the jam
    this.socket.on("add_player", player => { this.addPlayer(player) })
    // A player has left the jam
    this.socket.on("remove_player", player => { this.removePlayer(player) })
    // Server has dropped..
    this.socket.on("disconnect", () => { this.removeAllPlayers() })
  }

  deleteRemoteInstrument(id){
    delete this.remoteInstruments[id]
  }

  addRemoteInstrument(id){
    this.remoteInstruments[id] = new Instrument(this.socket, "poly_square")
  }
}


class PadsInterface extends Interface{
  build(){
    $(this.parent).html($("<div/>").addClass("block").attr({id: this.socket.id}))
    this.scaleIntervals.forEach((interval, index) => {
      let noteOctave = this.jam.local.rootOctave + parseInt((interval + NoteInterval(this.jam.global.rootNote))/12)
      let noteNumber = (interval + NoteInterval(this.jam.global.rootNote)) % 12
      let noteName = NoteIntervalToName(interval, this.jam.global.rootNote) + noteOctave
      $(this.id).append(
          $("<div/>")
            .addClass("pad")
            .css("background-color", this.colorPalette[noteNumber])
            .attr({
                "note": noteName,
                "trigger": true,
                "touch-action": "none"
            })
            .html(
              $("<div/>")
                .text(this.jam.global.showNotes ? noteName : "")
                .addClass("pad-note")
                .attr({"note": noteName})
            )
          )
      })
  }

  /* ADD ANOTHER PLAYER */
  addPlayer(id){
    $(this.id+" [trigger=true]").append(
      $("<div/>")
        .attr({client_id: id})
        .addClass("mini-pad")
    )
    this.addRemoteInstrument(id)
  }

  /* REMOVE ANOTHER PLAYER */
  removePlayer(id){
    $(this.id+" [client_id="+id+"]").remove()
    this.deleteRemoteInstrument(id)
  }

  /* REMOVE ALL OTHER PLAYERS */
  removeAllPlayers(){
    $(this.id+" .mini-pad").each((event) => {
      this.deleteRemoteInstrument($(event.target).attr('client_id'))
      $(event.target).remove()
    })
  }

  /* LOCAL PLAYER INTERACTION */
  unbindKeyboard(){
    KEYS_PAD.forEach(key => {
      Mousetrap.unbind(key, 'keydown')
      Mousetrap.unbind(key, 'keyup')
    })
  }

  bindKeyboard(){
    this.unbindKeyboard()
    $(this.id+" [trigger=true]").each((note, element) => {
      Mousetrap.bind(KEYS_PAD[note], (event) => {
        if (event.repeat == false) this.noteOn($(element).attr('note'))
      }, 'keydown')
      Mousetrap.bind(KEYS_PAD[note], () => { this.noteOff($(element).attr('note')) }, 'keyup')
    })
  }
}
