var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path')
var bonjour = require('bonjour')()
var ip = require('ip')

class EchoPlayServer{
  constructor(appRoot, port, appUrl) {
    this.appRoot = appRoot || __dirname
    this.port = port || 3000
    this.ip = ip.address()
    this.url = appUrl || "http://"+this.ip+":"+this.port
    this.defaultJamSettings()
    this.defaultEndpoints()
    this.start()
  }

  start(){
    this.serveStatic()
    server.listen(this.port)
    this.setupSocket()
    this.publishBonjour()
    console.log("join the jam @ "+this.url)
  }

  defaultEndpoints(){
    this.endpoints = [
      {url: '/js', path: path.join(__dirname, 'js')},
      {url: '/css', path: path.join(__dirname, 'css')},
      {url: '/instruments', path:path.join(__dirname, 'instruments') },
      {url: '/js/jquery', path: path.join(this.appRoot, 'node_modules', 'jquery', 'dist')},
      {url: '/js/tone', path: path.join(this.appRoot, 'node_modules', 'tone', 'build')},
      {url: '/js/mousetrap', path: path.join(this.appRoot, 'node_modules', 'mousetrap')},
    ]
  }

  serveStatic(){
    app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') })
    this.endpoints.map(endpoint => { this.addEndpoint(endpoint.url, endpoint.path) })
  }

  addEndpoint(url, path){
    app.use(url, express.static(path))
  }

  defaultJamSettings(){
    this.jamSettings = {
      rootNote: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][Math.floor(Math.random() * 12)],
      scale: ["major", "minor", "minor_harmonic", "gipsy"][Math.floor(Math.random() * 4)],
      showNotes: true,
    }
    this.instrumentPresets = new Object()
  }

  setupSocket(){
    // Socket.io
    io.on('connection', (socket) => {
      console.log("New connection:", socket.id)
      io.emit('url', this.url)

      socket.on('get_players', async () => {
        console.log(this.instrumentPresets)
        const clients = Array.from(await io.allSockets());
        socket.emit('players', clients, this.instrumentPresets);
        console.log("Current clients:", clients);
        console.log("Instruments", this.instrumentPresets)
      })

      socket.broadcast.emit('add_player', socket.id)
      socket.on('disconnect', (data) => {
        delete this.instrumentPresets[socket.id]
        socket.broadcast.emit('remove_player', socket.id)
      })

      socket.on("request_jam", () => {
        socket.emit("new_jam", this.jamSettings)
      })

      socket.on("instrument_preset", (preset) => {
        console.log("instrument_preset", preset)
        this.instrumentPresets[socket.id] = preset
        socket.broadcast.emit("load_instrument", socket.id, preset)
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
      })

      socket.on('note_off', (note) => {
        socket.broadcast.emit('note_off', {note, id: socket.id})
      })

      socket.on('release_all', () => {
        socket.broadcast.emit('release_all', socket.id)
      })

      socket.on('show_note_names', (show) => {
        this.jamSettings.showNotes = show
        io.emit('new_jam', this.jamSettings)
      })
    })
  }

  publishBonjour(){
    bonjour.publish({ name: 'EchoPlayServer', type: 'echoplay', port: this.port })
  }
}

module.exports.EchoPlayServer = EchoPlayServer
