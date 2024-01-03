/**
 * users.js
 */


const { v4: uuid } = require('uuid')
const users = {}
const groups = {}


const newUser = (socket) => {
  const user_id = uuid()
  console.log(`New connection from: ${user_id}`)
  users[user_id] = { socket }

  const message = JSON.stringify({
    subject: "connection",
    sender_id: "system",
    recipient_id: user_id
  })
  socket.send(message)
}


const treatMessage = (data) => {
  const { subject, sender_id, recipient_id, content } = data
  console.log("New message:", data);

  if (recipient_id === "system") {
    return treatSystemMessage(subject, sender_id, content)
  }

  switch (subject) {
    case "name":
      return setNameFor(id,  content)
  }
}


module.exports = {
  newUser,
  treatMessage
}



// SYSTEM MESSAGES // SYSTEM MESSAGES // SYSTEM MESSAGES //

const treatSystemMessage = (subject, sender_id, content) => {
  switch (subject) {
    case "login":
      return treatLogin(sender_id, content)
  }
}


const treatLogin = (user_id, content) => {
  const { user_name, group, create_group } = content
  // Ignore password for now
  const userData = users[user_id]
  if (!userData) {
    return console.log(`!userData for ${user_id}! This should never happen!`)
  }

  // Give a name to this user id
  userData.user_name = user_name

  // Join the group?
  const subject = "login"
  let owner_id, members, owner, status, reply
  let groupObject = groups[group]

  if (groupObject) {
    // A group of this name already exists
    ({ owner_id, members } = groupObject)
    owner = users[owner_id].user_name
  }

  if (create_group) {
    // Try to create a group, if requested
    if (groupObject) {
      status = "create-failed"

    } else {
      members = new Set().add(user_id)
      groups[group] = groupObject = {
        owner_id: user_id,
        members
      }
      status = "created"
      broadcastMembersToGroup(group, members)
    }

  } else if (groupObject) {
    members.add(user_id)
    broadcastMembersToGroup(group, members)
    status = "joined"

  } else {
    // The group does not yet exist, and there was no request to
    // create it.
    status = "join-failed"
  }

  content = { status, user_name, group, owner }

  // Reply
  const message = {
    sender_id: "system",
    recipient_id: user_id,
    subject,
    content
  }

  sendMessageToUser(message)
}


// SENDING MESSAGES // SENDING MESSAGES // SENDING MESSAGES //

const sendMessageToUser = (message) => {
  const { recipient_id } = message
  const { socket } = users[recipient_id]
  message = JSON.stringify(message)
  socket.send(message)
}


const sendMessageToGroup = (message) => {
  const { recipient_id } = message
  message = JSON.stringify(message)
  recipient_id.forEach( user_id => {
    const { socket } = users[user_id]
    socket.send(message)
  })
}


const broadcastMembersToGroup = (group, recipient_id) => {
  recipient_id = Array.from(recipient_id)
  const members = recipient_id.reduce((map, user_id) => {
    map[ users[user_id].user_name ] = user_id
    return map
  }, {})

  const content = {
    group,
    members
  }

  const message = {
    sender_id: "system",
    recipient_id,
    subject: "group-members",
    content
  }

  sendMessageToGroup(message)
}