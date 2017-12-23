var {EchoPlayServer} = require('./EchoPlayServer.js')
var server = new EchoPlayServer(process.cwd())
server.start()
