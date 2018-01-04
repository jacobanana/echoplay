/*
NOTES UTILITIES
Adrien Fauconnet - 2017
*/

Array.prototype.rotate = function(times){
  while(times--){
    var temp = this.shift();
    this.push(temp);
  }
  return this;
}

Array.prototype.remove = function(element){
    const index = this.indexOf(element);
    this.splice(index, 1);
    return this;
}

/*****************************************************************************/
/* Note.names
/*****************************************************************************/
const NOTE_NAMES = "C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B".split(" ");


/*****************************************************************************/
/* Note.notes
/*****************************************************************************/
const NOTES = NOTE_NAMES.filter(name => (!name.includes("#") && !name.includes("b")));


/*****************************************************************************/
/* Note.sharps
/*****************************************************************************/
const SHARPS = NOTE_NAMES.filter(name => (name.includes("#") || !name.includes("b")));


/*****************************************************************************/
/* Note.flats
/*****************************************************************************/
const FLATS = NOTE_NAMES.filter(name => (name.includes("b") || !name.includes("#")));


/*****************************************************************************/
/* Note.tokenize(noteName)
/* splits a note name into its note name and octave
/*****************************************************************************/
function NoteTokenize(noteName){
  if (typeof noteName !== "string") return null
  let tokens = /\b([A-G]|[a-g])(#|b|)([0-9]|10|11|)\b/g.exec(noteName)
  if (tokens){
    let note = tokens[1]+tokens[2]
    let octave = parseInt(tokens[3])
    if (isNaN(octave)) octave = null
    return [note, octave]
  }
  else return null
}


/*****************************************************************************/
/* Note.interval
/*****************************************************************************/
function NoteInterval(note, tonic = "C"){
  let tonicIndex
  note = NoteTokenize(note)[0]
  if (SHARPS.includes(tonic)) tonicIndex = SHARPS.indexOf(tonic)
  else if (FLATS.includes(tonic)) tonicIndex = FLATS.indexOf(tonic)
  else tonicIndex = 0

  if (SHARPS.includes(note)) return SHARPS.rotate(tonicIndex).indexOf(note)
  else if (FLATS.includes(note)) return FLATS.rotate(tonicIndex).indexOf(note)
  else {
    console.log(note, tonicIndex)
    return null
  }
}


/*****************************************************************************/
/* Note.midi
/*****************************************************************************/
function NoteToMidi(note){
    if (typeof note === "string"){
      let tokens = NoteTokenize(note)
      if (tokens === null) return null
      else return 12 * (tokens[1]+1) + NoteInterval(tokens[0]) - 24
    } else if (typeof note === "number") return note
}


/*****************************************************************************/
/* Note.fromMidi
/*****************************************************************************/
function NoteFromMidi(midiNote){
  if (typeof midiNote == "number"){
    return SHARPS[midiNote % 12]+(parseInt(midiNote / 12) + 1).toString()
  }
}


/*****************************************************************************/
/* Note.freq
/*****************************************************************************/
function NoteFreq(note, tuning = 440){
  let midiNote
  if (typeof note === "string"){
    midiNote = NoteToMidi(note)
    if (midiNote === null) return null
  }
  else if (typeof note === "number") midiNote = note
  else return null
  return +(((tuning / 32) * Math.pow(2, (midiNote - 9) / 12)).toFixed(2))
}


/*****************************************************************************/
/* NoteIntervalToName
/*****************************************************************************/
function NoteIntervalToName(interval, tonic = "C", notation = "#"){
  let rootInterval = NoteInterval(tonic)
  function NoteName(interval){
    let noteNumber = (interval + rootInterval) % 12
    if (notation == "#"){
      return SHARPS[noteNumber]
    } else {
      return FLATS[noteNumber]
    }
  }
  switch (interval.constructor){
      case Number:
        return NoteName(interval)
      case Array:
        return interval.map(i => NoteName(i))
      default:
        return null
  }
}


const SCALES = new Object
SCALES.major = {definition: [0,2,4,5,7,9,11], rootRepeat: true}
SCALES.minor = {definition: [0,2,3,5,7,8,10], rootRepeat: true}
SCALES.minor_harmonic = {definition: [0,2,3,5,7,8,11], rootRepeat: true}
SCALES.gipsy = {definition: [0,2,3,6,7,8,11], rootRepeat: true}
SCALES.pentatonic = {definition: [0,2,5,7,9], rootRepeat: false}
SCALES.minor_melodic_asc = {definition: [0,2,3,5,7,9,11], rootRepeat: true}
SCALES.minor_melodic_desc = {definition: [0,2,3,5,7,8,10], rootRepeat: true}
SCALES.octatonic = {definition: [0,1,3,4,6,7,9,10], rootRepeat: false}
SCALES.chromatic = {definition: [0,1,2,3,4,5,6,7,8,9,10,11], rootRepeat: false}


function buildScale(scale, octaveRange = 1){
  let scaleDefinition = SCALES[scale].definition.slice();
  let scaleIntervals = new Array()
  let repeat = new Array()
  let totalNumberOfNotes = (scaleDefinition.length + SCALES[scale].rootRepeat) * octaveRange
  if (SCALES[scale].rootRepeat==true) {
    scaleDefinition.push(12)
    repeat.push(scaleDefinition.length)
  }
  for (i = 0; i<totalNumberOfNotes; i++){
    scaleIntervals.push(scaleDefinition[i%scaleDefinition.length] + parseInt(i/scaleDefinition.length) * 12)
  }
  return {
    name: scale,
    definition: scaleDefinition,
    intervals: scaleIntervals,
    repeat: repeat
  }
}
