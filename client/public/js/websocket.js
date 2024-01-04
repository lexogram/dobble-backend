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
  if (wasClean) {
    location.hash = "login"
    focusOn(".user_name")

  } else {
    if (!reason) {
      reason = {
        "1000": "Normal Closure",
        "1001": "Going Away",
        "1002": "Protocol error",
        "1003": "Unsupported Data",
        "1004": "Reserved",
        "1005": "No Status Rcvd",
        "1006": "The server shut down unexpectedly.", // "Abnormal Closure",
        "1007": "Invalid frame payload data",
        "1008": "Policy Violation",
        "1009": "Message Too Big",
        "1010": "Mandatory Ext.",
        "1011": "Internal Error",
        "1012": "Service Restart",
        "1013": "Try Again Later ",
        "1014": "Bad Gateway",
        "1015": "TLS handshake"
      }[code]

      if (!reason) {
        reason = "An unexpected error occured."
      }
    }

    location.hash = "error"
    document.querySelector(":target .reason").textContent = reason
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