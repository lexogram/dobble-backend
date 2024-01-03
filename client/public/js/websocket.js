/**
 * websocket.js
 * 
 */

"use strict"
// Open a web socket and connect to the server


const URL = `ws://${location.host}`

const socket = new WebSocket(URL);
let user_id


socket.onopen = () => {
  location.hash = "login"
  focusOn(".user_name")
}


// Treat any replies from the server
socket.onmessage = (event) => {
  const string = event.data
  console.log("Reply received:", string )

  try {
    const data = JSON.parse(string)
    const { subject, sender_id, recipient_id, content } = data

    switch (subject) {
      case "connection":
        return handleConnection(recipient_id)
      case "login":
        return handleLogin(content)
      case "group-members":
        return updateGroupMembers(content)
    };
  } catch {

  }
}


function handleConnection(id) {
  user_id = id
}