// Create a basic http server running express
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer() // no destination folder required... yet
const multipart = upload.none();
const { v4: uuid } = require('uuid')


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

const users = {}

const WSServer = new WebSocket.Server({ server })
WSServer.on('connection', (socket) => {
  const id = uuid()
  console.log(`New connection from: ${id}`)
  users[id] = { socket }

  const welcome = JSON.stringify({ subject: "connection", id })
  socket.send(welcome)

  socket.on('message', message => {
    try {
      const data = JSON.parse(message.toString())
      const { subject, id, content } = data
      console.log("New message:", data);

      switch (subject) {
        case "name":
          return setNameFor(id,  content)
      }
    } catch {

    }
  })


  function setNameFor(id, name) {
    const userObject = users[id]
    userObject.name = name

    const message = JSON.stringify({
      subject: "chat",
      sender: "system",
      recipient: id,
      content: `Welcome, ${name}!`
    })

    socket.send(message)
  }
})