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
    synth.triggerRelease()
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
  let triggeredNotes = 0

  function noteOn(note, trigger = true){
    if (triggeredNotes > 0 || trigger === true){
      synth.triggerAttack(note);
      socket.emit("note_on", note)
      $("[note='"+note+"']").addClass("o-1")
    }
    if (trigger === true) {
      triggeredNotes += 1
    }
  }

  function noteOff(note){
    triggeredNotes -= 1
    if (triggeredNotes <= 0) {
      synth.triggerRelease()
      triggeredNotes = 0;
    }
    socket.emit("note_off", note)
    $("[note='"+note+"']").removeClass("o-1")
  }


  $("[trigger=true]").on('pointerdown', function(){
    noteOn($(this).attr("note"))
  })
  $("[trigger=true]").on('pointerup', function(){
    noteOff($(this).attr("note"))
  })

  $("[trigger=true]").on('pointerenter', function(){ noteOn($(this).attr("note"), false) })

  $("[trigger=true]").on('pointerleave', function(){
    let note = $(this).attr("note")
    $("[note='"+note+"']").removeClass("o-1")
    socket.emit("note_off", $(this).attr("note"))
  })

  // Safety all note off when releasing the pointer on the header bar
  $("#header").on('pointerup', function(){
    triggeredNotes = 0
    synth.triggerRelease()
    socket.emit("all_note_off")
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
  socket.on("all_note_off", function(data){
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
