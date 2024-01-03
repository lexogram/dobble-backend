// Create a basic http server running express
const http = require('http')
const express = require('express')
// Utilities
const path = require('path')
require('dotenv').config()

const PORT = process.env.PORT || 3000

// Custom requirements
const websocket = require('./websocket')


const app = express()
const server = http.createServer(app)

// Start the server
server.listen(PORT, () => {
  console.log(`http server running on port ${PORT}`)
})

// Tell client/index.html where to find images and scripts
const staticPath = path.resolve(__dirname, '../client/public')
app.use(express.static(staticPath));

// Provide an endpoint to serve a client page
app.get('/', function (req, res) {
  const filePath = path.resolve(__dirname, '../client/index.html')  
  res.sendFile(filePath);
})


// Add a WebSocket that uses the ws:// protocal and can keep a TCP
// channel open and push messages through it to the client
websocket(server)