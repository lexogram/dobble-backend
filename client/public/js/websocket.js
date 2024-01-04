/**
 * websocket.js
 *
 * Opens a web socket and connect to the server
 */

"use strict"


let URL = location.host
const protocol = (URL.startsWith("localhost")) ? "ws" : "wss"
URL = `${protocol}://${URL}`


const socket = new WebSocket(URL);
let user_id


socket.onopen = () => {
  location.hash = "login"
  focusOn(".user_name")
}


// Treat any replies from the server
socket.onmessage = (event) => {
  const string = event.data

  try {
    const data = JSON.parse(string)
    const { subject, recipient_id, content } = data

    switch (subject) {
      case "connection":
        return handleConnection(recipient_id)
      case "login":
        return handleLogin(content)
      case "group-members":
        return updateGroupMembers(content)
      case "chat":
        return handleChat(data)
    };
  } catch {

  }
}


socket.onclose = ({ wasClean, code, reason }) => {
  // console.log("wasClean:", wasClean);
  // console.log("code:", code);
  // console.log("reason:", reason);

  if (wasClean) {
    location.hash = "login"
    focusOn(".user_name")

  } else {
    location.hash = "error"
    focusOn(":target button")
  }
}


socket.onerror = (a, b, c) => {
  console.log("a, b, c:", a, b, c);

  location.hash = "error"
  focusOn(":target button")
}


function handleConnection(id) {
  user_id = id
}