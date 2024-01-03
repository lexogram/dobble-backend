/**
 * login.jsx
 * 
 * This script has access to the `socket` created in the 
 * websocket.js script
 */


// user_id is declared in websocket.js


const focusOn = selector => {
  const element = document.querySelector(selector)
  element.focus()
}


// Login form
const form = document.querySelector("#login form")
const sendForm = async (event) => {
  event.preventDefault()

  const data = Array.from(new FormData(form))
  const content = data.reduce((map, [ key, value ]) =>{
    map[key] = value === "true" ? true : value
    return map
  }, {})
  const subject = "login"
  const sender_id = user_id
  const recipient_id = "system"

  const message = {
    subject,
    sender_id,
    recipient_id,
    content
  }

  const json = JSON.stringify(message)

  socket.send(json)
}
form.addEventListener("submit", sendForm, false)



const loginAgain = Array.from(
  document.querySelectorAll(".login-again")
)
loginAgain.forEach( button => button.addEventListener(
  "click", () => {
    location.hash = "login"
 })
)



const joinChat = Array.from(
  document.querySelectorAll(".join-chat")
)
joinChat.forEach( button => button.addEventListener(
  "click", () => {
    location.hash = "chat"
 })
)



function handleLogin(content) {
  const { status, user_name, group, owner } = content

  const feedback = (status === "created")
  ? `Congratulations, ${user_name}! You have created the group "${group}".`
  : (status === "create-failed")
    ? `The group "${group}" was already created by ${owner}. Did you want to join it, or to create a different group?`
    : (status === "joined")
      ? `Congratulations, ${user_name}! You are now a member of group "${group}".`
      : `The group "${group}" does not exist yet. Was this a typo or did you want to create the group "${group}"?`

  location.hash = status
  document.querySelector(`#${status} p`).textContent = feedback
}