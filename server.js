var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path')

let port = process.env.PORT || 3000
let hostname = require('os').hostname().toLowerCase()
let url = "http://"+hostname+":"+port

console.log("join the jam @ "+url)

var QRCode = require('qrcode')
QRCode.toString(url, function (err, string) {
  if (err) throw err
  console.log(string)
})

// Express
server.listen(port);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/css', express.static(path.join(__dirname, 'css')))
app.use('/js/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')))
app.use('/js/pep', express.static(path.join(__dirname, 'node_modules', 'pepjs', 'dist')))
app.use('/js/tone', express.static(path.join(__dirname, 'node_modules', 'tone', 'build')))
app.use('/js/mousetrap', express.static(path.join(__dirname, 'node_modules', 'mousetrap')))
app.use('/js/qrcode', express.static(path.join(__dirname, 'node_modules', 'qrcode', 'build')))


let jamSettings = {
  rootNote: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][Math.floor(Math.random() * 12)],
  scale: ["major", "minor", "minor_harmonic", "gipsy"][Math.floor(Math.random() * 4)],
  showNotes: true,
}

// Socket.io
io.on('connection', function (socket) {
  io.emit('url', url)

  socket.on('get_players', function(){
    io.clients((error, clients) => {
      if (error) throw error;
      socket.emit('players', clients);
      console.log(clients);
    })
  })

  socket.broadcast.emit('add_player', socket.id)
  socket.on('disconnect', function (data) {
    socket.broadcast.emit('remove_player', socket.id)
  })

  socket.on("request_jam", function(){
    socket.emit("new_jam", jamSettings)
  })

  socket.on("update_jam", function(jam){
    jamSettings = jam
    io.emit("new_jam", jamSettings)
  })

  socket.on("share_locals", function(localSettings){
    socket.broadcast.emit("share_locals", localSettings)
  })

  socket.on('note_on', function(note){
    socket.broadcast.emit('note_on', {note, id: socket.id})
  });

  socket.on('note_off', function(note){
    socket.broadcast.emit('note_off', {note, id: socket.id})
  });

  socket.on('all_note_off', function(){
    socket.broadcast.emit('all_note_off', socket.id)
  });

  socket.on('show_note_names', function(show){
    jamSettings.showNotes = show
    io.emit('new_jam', jamSettings)
  })

});
