/**
 * groups.js
 *
 */

const groupForm = document.querySelector(".group")
const groupName = groupForm.querySelector(".group-name")
const membersList = groupForm.querySelector(".group-members")

const history = document.querySelector(".history")
const compose = document.getElementById("compose")
const sendButton = document.getElementById("send")
let recipient_id


const byUserName = (a, b) => {
  if (a[1] === user_id) {
    return -1
  } else if (b[1] === user_id) {
    return 1
  } else {
    return a[0] > b[0] ? 1 : 0
  }
}


const updateGroupMembers = ({ group, members }) => {
  groupName.textContent = group
  members = Object.entries(members)
  let innerHTML = members
  .sort(byUserName)
  .slice(1)
  .reduce(
    ( html, [ user_name, id ] ) => {
      html += `<li>
        <label for="${id}">
          <input
            id="${id}"
            type="checkbox"
            name=${id}
            value=${id}
            checked
          />
          <span>${user_name}</span
        </label>
      </li>`

      return html
    },
  "")

  if (members.length < 2) {
    innerHTML += `<li class="center">No-one else is here now.</li>`
  }
  membersList.innerHTML = innerHTML

  const maxHeight = Math.max(
    1, Math.min(4, members.length - 1)
  ) * 1.8 + 0.5 + "em"

  document.body.style.setProperty( "--ul-height", maxHeight )
  updateRecipients()
}


const updateRecipients = () => {
  const data = Array.from(new FormData(groupForm))
  recipient_id = data.map(([ key, value ]) => value)
  setDisabled()
}


const setDisabled = () => {
  const disabled = !recipient_id.length || !compose.value

  if (disabled) {
    sendButton.setAttribute("disabled", true)
  } else {
    sendButton.removeAttribute("disabled")
  }
}


const checkForEnter = event => {
  if (event.key === "Enter") {
    event.preventDefault()
    if (recipient_id.length) {
      sendMessage()
    }
  }
}


const addMessage = (from, content, sender) => {
  const p = document.createElement("p")
  p.classList.add(from)
  p.textContent = `${sender ? sender + ": " : ""}${content}`;
  history.appendChild(p)
}


const sendMessage = () => {
  const subject = "chat"
  const sender_id = user_id
  const content = compose.value
  const message = JSON.stringify({
    subject,
    sender_id,
    recipient_id,
    content
  })

  addMessage("us", content)
  compose.value = ""
  
  socket.send(message)
}


const handleChat = data => {
  const { sender, content } = data
  addMessage("them", content, sender)
}


groupForm.addEventListener("change", updateRecipients)
sendButton.addEventListener("click", sendMessage)
compose.addEventListener("keydown", checkForEnter)
compose.addEventListener("keyup", setDisabled)