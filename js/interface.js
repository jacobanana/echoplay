/* Scaled PAD like interface */

function buildInterface(jam){
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
    instrument.triggerRelease()
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
}

/* REMOVE ANOTHER PLAYER */

function removePlayer(id){
  $("[client_id="+id+"]").remove()
}

/* REMOVE ALL OTHER PLAYERS */

function removeAllPlayers(){
  $(".mini-pad").remove()
}

/* LOCAL PLAYER INTERACTION */

function bindInterface(){
  function noteOn(note, trigger = true, retrigger = false){
    if (instrument.polyphony == 1 || instrument.triggeredNotes < instrument.polyphony){
      if (instrument.triggeredNotes > 0 || trigger === true) $("[note='"+note+"']").addClass("o-1")
      instrument.triggerAttack(note, trigger, retrigger)
    }
  }

  function noteOff(note){
    if($("[note='"+note+"'] .o-1").length > 0){
      instrument.triggerRelease(note)
      $("[note='"+note+"']").removeClass("o-1")
    }
  }

  function noteLeave(note){
    instrument.noteLeave(note)
  }


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
    instrument.releaseAll()
    $("[trigger=true]").removeClass("o-1")
  })

  $("[trigger=true]").each(function(note) {
    Mousetrap.bind(KEYS_PAD[note], (event) => {
      if (event.repeat == false) noteOn($(this).attr('note'))
    }, 'keydown')
    Mousetrap.bind(KEYS_PAD[note], () => { noteOff($(this).attr('note')) }, 'keyup')
  })
}

/* DISPLAY OTHER PLAYERS DATA */

function bindSocketsToInterface(){
  // Receives note data from other players
  socket.on("note_on", function(data){
    $("[note='"+data.note+"'] > [client_id="+data.id+"]").addClass("o-1")
  })
  socket.on("note_off", function(data){
    $("[note='"+data.note+"'] > [client_id="+data.id+"]").removeClass("o-1")
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
}


/* COMPUTER KEYBOARD TRIGGER */

const KEYS_PAD = [
  "z", "x", "c", "v", "b", "n", "m", ",",
  "a", "s", "d", "f", "g", "h", "j", "k",
  "w", "e", "r", "t", "y", "u", "i", "o",
  "2", "3", "4", "5", "6", "7", "8", "9"
]
