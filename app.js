// Create a basic http server running express
const http = require('http')
const express = require('express')

const PORT = 3000

const app = express()
const server = http.createServer(app)

// Start the server
server.listen(PORT, () => {
  console.log(`http server running on http://localhost:${PORT}`)
})


// Provide an endpoint to serve a client page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})


// Add a WebSocket that uses the ws:// protocal and can keep a TCP
// channel open and push messages through it to the client
const WebSocket = require('ws')

const WSServer = new WebSocket.Server({ server })
WSServer.on('connection', (socket) => {
  console.log("New connection")

  socket.on('message', (data) => {
    const message = data.toString() // data is a buffer
    console.log("New message:", message);
    socket.send('Thanks for connecting');
  })
})