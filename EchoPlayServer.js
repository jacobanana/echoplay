var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path')

class EchoPlayServer{
  constructor(appRoot, appUrl, port) {
    this.appRoot = appRoot || __dirname
    this.port = port || 3000
    this.hostname = require('os').hostname().toLowerCase()
    this.url = appUrl || "http://"+this.hostname+":"+this.port
    this.defaultJamSettings()
    this.defaultEndpoints()
  }

  start(){
    server.listen(this.port)
    this.serveStatic()
    this.setupSocket()
    console.log("join the jam @ "+this.url)
  }

  defaultEndpoints(){
    this.endpoints = [
      {url: '/js', path: path.join(__dirname, 'js')},
      {url: '/css', path: path.join(__dirname, 'css')},
      {url: '/instruments', path:path.join(__dirname, 'instruments') },
      {url: '/js/jquery', path: path.join(this.appRoot, 'node_modules', 'jquery', 'dist')},
      {url: '/js/pep', path: path.join(this.appRoot, 'node_modules', 'pepjs', 'dist')},
      {url: '/js/tone', path: path.join(this.appRoot, 'node_modules', 'tone', 'build')},
      {url: '/js/mousetrap', path: path.join(this.appRoot, 'node_modules', 'mousetrap')},
      {url: '/js/qrcode', path: path.join(this.appRoot, 'node_modules', 'qrcode', 'build')},
    ]
  }

  defaultJamSettings(){
    console.log("default settings")
    this.jamSettings = {
      rootNote: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][Math.floor(Math.random() * 12)],
      scale: ["major", "minor", "minor_harmonic", "gipsy"][Math.floor(Math.random() * 4)],
      showNotes: true,
    }
  }

  serveStatic(){
    app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') })
    this.endpoints.map(endpoint => { this.addEndpoint(endpoint.url, endpoint.path) })
  }

  addEndpoint(url, path){
    app.use(url, express.static(path))
  }

  setupSocket(){
    // Socket.io
    io.on('connection', (socket) => {
      io.emit('url', this.url)

      socket.on('get_players', () => {
        io.clients((error, clients) => {
          if (error) throw error;
          socket.emit('players', clients);
          console.log(clients);
        })
      })

      socket.broadcast.emit('add_player', socket.id)
      socket.on('disconnect', (data) => {
        socket.broadcast.emit('remove_player', socket.id)
      })

      socket.on("request_jam", () => {
        console.log(this.jamSettings)
        socket.emit("new_jam", this.jamSettings)
      })

      socket.on("update_jam", (jam) => {
        this.jamSettings = jam
        io.emit("new_jam", this.jamSettings)
      })

      socket.on("share_locals", (localSettings) => {
        socket.broadcast.emit("share_locals", localSettings)
      })

      socket.on('note_on', (note) => {
        socket.broadcast.emit('note_on', {note, id: socket.id})
      });

      socket.on('note_off', (note) => {
        socket.broadcast.emit('note_off', {note, id: socket.id})
      });

      socket.on('release_all', () => {
        socket.broadcast.emit('release_all', socket.id)
      });

      socket.on('show_note_names', (show) => {
        this.jamSettings.showNotes = show
        io.emit('new_jam', this.jamSettings)
      })
    });
  }
}

module.exports.EchoPlayServer = EchoPlayServer
