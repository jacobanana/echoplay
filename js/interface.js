/* Scaled PAD like interface */
class Interface{
  constructor(parent, socket, players){
    this.socket = socket
    this.id = "#"+socket.id
    this.players = players
    this.instrument = this.players[socket.id].instrument
    this.parent = parent || "#interface"
    this.setPalette(0.5,128,127,12,40)
  }

  buildAndBindAll(){
    this.build()
    this.bindMouseAndTouch()
    this.bindKeyboard()
  }

  setPalette(frequency, center, width, len, off){
    off = off || 20
    this.colorPaletteOn = makeColorPalette(frequency, center, width, len)
    this.colorPaletteOff = makeColorPalette(frequency, center+off, width-off, len)
  }

  setupJam(jam){
    this.jam = jam
    this.scale = buildScale(this.jam.global.scale, this.jam.local.octaveRange)
    this.buildAndBindAll()
  }

  noteOn(note, trigger = true, retrigger = false, velocity = 1){
    try{
      if (this.instrument.polyphony == 1 || this.instrument.triggeredNotes.length < this.instrument.polyphony){
        if (this.instrument.triggeredNotes.length > 0 || trigger === true){
          if (this.scale.intervals.indexOf(NoteInterval(NoteTokenize(note)[0], this.jam.global.rootNote)) != -1){
            $(this.id+" [note='"+note+"']")
              .css("background-color", this.colorPaletteOn[NoteInterval(note.replace(/\d+/g, ''))])
            this.instrument.triggerAttack(note, trigger, retrigger, velocity)
          }
        }
      }
    } catch(e) {
      console.log(e)
    }
  }

  noteOff(note, force = false){
    try{
      if(this.instrument.triggeredNotes.length > 0 || force == true){
        this.instrument.triggerRelease(note)
      }
    } catch(e){
      console.log(e)
    }
    $(this.id+" [note='"+note+"']")
      .css("background-color", this.colorPaletteOff[NoteInterval(note.replace(/\d+/g, ''))])

  }

  noteLeave(note){
    try{
      this.instrument.noteLeave(note)
    } catch(e){
      console.log(e)
    }
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
      $(this.id+" [note='"+note+"']")
        .css("background-color", this.colorPaletteOff[NoteInterval(note.replace(/\d+/g, ''))])
    })

    // Safety all note off when releasing the pointer on the header bar
    $("#header").on('pointerup', () => {
      this.instrument.releaseAll()
//      $(this.id+" [trigger=true]")
//        .css("background-color", this.colorPaletteOn[NoteInterval(note)])
//        .attr({"on": off})
    })
  }


  /* DISPLAY OTHER PLAYERS DATA */

  bindSockets(){
    // Receives note data from other players
    this.socket.on("note_on", data => {
      $(this.id+" [note='"+data.note+"'] > [client_id="+data.id+"]").addClass("o-1")
      try{
        if (this.players[data.id].play == true && this.players[data.id].instrument)
        {
          this.players[data.id].instrument.triggerAttack(data.note, true, false)
        }
      } catch(e){
        console.log(e)
      }
    })
    this.socket.on("note_off", data => {
      $(this.id+" [note='"+data.note+"'] > [client_id="+data.id+"]").removeClass("o-1")
      try{
        if (this.players[data.id].play && this.players[data.id].instrument) {
          this.players[data.id].instrument.triggerRelease(data.note)
        }
      } catch(e) {
        console.log(e)
      }
    })
    this.socket.on("release_all", data => {
      $(this.id+" [trigger=true] > [client_id="+data.id+"]").removeClass("o-1")
    })

    // Server has dropped..
    this.socket.on("disconnect", () => { this.removeAllPlayers(); alert("Server disconnected... you are now playing by yourself") })
  }
}


class PadsInterface extends Interface{
  build(){
    $(this.parent).html($("<div/>").addClass("block").attr({id: this.socket.id}))
    this.scale.intervals.forEach((interval, index) => {
      let noteOctave = this.jam.local.rootOctave + parseInt((interval + NoteInterval(this.jam.global.rootNote))/12)
      let noteNumber = (interval + NoteInterval(this.jam.global.rootNote)) % 12
      let noteName = NoteIntervalToName(interval, this.jam.global.rootNote) + noteOctave
      $(this.id).append(
          $("<div/>")
            .addClass("pad"+ (
              (this.scale.repeat.indexOf(index) != -1 ||
               this.scale.intervals.indexOf(interval)==this.scale.intervals.length-1)
               ? " repeat" : "")
             )
            .css("background-color", this.colorPaletteOff[noteNumber])
            .attr({
                "note": noteName,
                "trigger": true,
                "touch-action": "none"
            })
            .html(
              $("<div/>")
                .text(this.jam.global.showNotes ? noteName : "")
                .addClass("pad-note")
            )
          )
      })
      Object.keys(this.players).forEach(id => {
        $(this.id+" [trigger=true]").append(
          $("<div/>")
            .attr({client_id: id})
            .addClass("mini-pad")
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
  }

  /* REMOVE ANOTHER PLAYER */
  removePlayer(id){
    $(this.id+" [client_id="+id+"]").remove()
  }

  /* REMOVE ALL OTHER PLAYERS */
  removeAllPlayers(){
    console.log("remove all players..")
    $(this.id+" .mini-pad").remove()
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
        if (event.repeat == false || event.repeat === undefined) this.noteOn($(element).attr('note'))
      }, 'keydown')
      Mousetrap.bind(KEYS_PAD[note], () => { this.noteOff($(element).attr('note')) }, 'keyup')
    })


    Object.keys(ACCESSIBLE_KEYS).forEach((key)=>{

      Mousetrap.bind(key, (event) => {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            // internet explorer
            event.returnValue = false;
        }
        if (event.repeat == false) {
          Mousetrap.trigger(ACCESSIBLE_KEYS[key], 'keydown')
        }
      }, 'keydown')
      Mousetrap.bind(key, () => { Mousetrap.trigger(ACCESSIBLE_KEYS[key], 'keyup') }, 'keyup')

    })

  }
}
