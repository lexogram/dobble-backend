// Create a basic http server running express
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer() // no destination folder required... yet
const multipart = upload.none();


const PORT = 3000
const {
  enterRouter
} = require('./routes')


const app = express()
const server = http.createServer(app)

// Start the server
server.listen(PORT, () => {
  console.log(`http server running on http://localhost:${PORT}`)
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// for parsing multipart/form-data
// !!! The FormData object created by new FormData(form) uses the
// same format a form would use if its encoding type were set to
// multipart/form-data.
app.use(multipart);
app.use(express.static('public'));


// Provide an endpoint to serve a client page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})


app.use('/enter', enterRouter);



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