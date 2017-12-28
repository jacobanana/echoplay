/* Scaled PAD like interface */

function buildInterface(jam){
  instrument[socket.id] = new Instrument(jam.local.instrumentPreset)
  let scaleIntervals = buildScale(jam.global.scale, jam.local.octaveRange)
  $("#interface").html($("<div></div>").addClass("block"))
  scaleIntervals.forEach((interval, index) => {
    let noteOctave = jam.local.rootOctave + parseInt((interval + NoteInterval(jam.global.rootNote))/12)
    let noteNumber = (interval + NoteInterval(jam.global.rootNote)) % 12
    let noteName = NoteIntervalToName(interval, jam.global.rootNote) + noteOctave
    $(".block").append(
        $("<div/>")
          .addClass("pad")
          .css("background-color", colorPalette[noteNumber])
          .attr({
              "note": noteName,
              "trigger": true,
              "touch-action": "none"
          })
          .html(
            $("<div/>")
              .text(jam.global.showNotes ? noteName : "")
              .addClass("pad-note")
              .attr({"note": noteName})
          )
        )
    })
    instrument[socket.id].triggerRelease()
    bindInterface()
    socket.emit("get_players")
}

/* ADD ANOTHER PLAYER */

function addPlayer(id){
  $("[trigger=true]").append(
    $("<div/>")
      .attr({client_id: id})
      .addClass("mini-pad")
  )
  instrument[id] = new Instrument("poly_square")
}

/* REMOVE ANOTHER PLAYER */

function removePlayer(id){
  $("[client_id="+id+"]").remove()
  delete instrument[id]
}

/* REMOVE ALL OTHER PLAYERS */

function removeAllPlayers(){
  $(".mini-pad").remove()
}

/* LOCAL PLAYER INTERACTION */
function unbindKeyboard(){
  KEYS_PAD.forEach(key => {
    Mousetrap.unbind(key, 'keydown')
    Mousetrap.unbind(key, 'keyup')
  })
}

function bindKeyboard(){
  unbindKeyboard()
  $("[trigger=true]").each(function(note) {
    Mousetrap.bind(KEYS_PAD[note], (event) => {
      if (event.repeat == false) noteOn($(this).attr('note'))
    }, 'keydown')
    Mousetrap.bind(KEYS_PAD[note], () => { noteOff($(this).attr('note')) }, 'keyup')
  })
}

function bindInterface(){
  $("[trigger=true]").on('pointerdown', function(){
    noteOn($(this).attr("note"))
  })
  $("[trigger=true]").on('pointerup', function(){
    noteOff($(this).attr("note"))
  })

  $("[trigger=true]").on('pointerenter', function(){ noteOn($(this).attr("note"), false, true) })

  $("[trigger=true]").on('pointerleave', function(){
    let note = $(this).attr("note")
    noteLeave(note)
    $("[note='"+note+"']").removeClass("o-1")
  })

  // Safety all note off when releasing the pointer on the header bar
  $("#header").on('pointerup', function(){
    instrument[socket.id].releaseAll()
    $("[trigger=true]").removeClass("o-1")
  })

  bindKeyboard()
}

/* DISPLAY OTHER PLAYERS DATA */

function bindSocketsToInterface(){
  // Receives note data from other players
  socket.on("note_on", function(data){
    $("[note='"+data.note+"'] > [client_id="+data.id+"]").addClass("o-1")
    if (jamSettings.local.playRemote == true) instrument[data.id].inst.triggerAttack(data.note)
  })
  socket.on("note_off", function(data){
    $("[note='"+data.note+"'] > [client_id="+data.id+"]").removeClass("o-1")
    if (jamSettings.local.playRemote == true) instrument[data.id].inst.triggerRelease(data.note)
  })
  socket.on("release_all", function(data){
    $("[trigger=true] > [client_id="+data.id+"]").removeClass("o-1")
  })

  // Refresh the full list of players
  socket.on("players", function(clients){
    removeAllPlayers()
    clients.forEach(function(client){
      if (client != socket.id) addPlayer(client)
    })
  })

  // Add a new player to the jam
  socket.on("add_player", function(player){ addPlayer(player) })
  // A player has left the jam
  socket.on("remove_player", function(player){ removePlayer(player) })
  // Server has dropped..
  socket.on("disconnect", function(){ removeAllPlayers() })
}

/* Instrument triggers */

function noteOn(note, trigger = true, retrigger = false, velocity = 1){
  if (instrument[socket.id].polyphony == 1 || instrument[socket.id].triggeredNotes < instrument[socket.id].polyphony){
    if (instrument[socket.id].triggeredNotes > 0 || trigger === true) $("[note='"+note+"']").addClass("o-1")
    instrument[socket.id].triggerAttack(note, trigger, retrigger, velocity)
  }
}

function noteOff(note, force = false){
  if($("[note='"+note+"'] .o-1").length > 0 || force == true){
    instrument[socket.id].triggerRelease(note)
    $("[note='"+note+"']").removeClass("o-1")
  }
}

function noteLeave(note){
  instrument[socket.id].noteLeave(note)
}
