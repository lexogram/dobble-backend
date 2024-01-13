/**
 * server/game/index.js
 */

const GAME = "game"

const {
  addMessageListener,
  removeMessageListener,
  sendMessageToUser,
  sendMessageToGroup
} = require("../websocket/users");
const publicPath = "../../public/"
const packData = require(
  `${publicPath}dobble/packs.json`
)
const { shuffle } = require('../utilities/shuffle')


const dobbleData = {}
/*  { <group_name>: {
        votes: {
          <pack_name>: [ <user_id>, ... ],
          ...
        },
        gameData: {
          <read from /dobble/<pack_name>/index.json>
        }
      }
    }
*/


const treatGameMessages = (messageData) => {
  switch (messageData.subject) {
    // case "join_group":
    //   return joinGroup(messageData)
    case "vote":
      return treatVote(messageData)
    case "select_pack":
      return selectPack(messageData)
  }
}


const joinGroup = ({ sender_id, content }) => {
  const { group_name } = content
  const groupData = dobbleData[group_name]
                || (dobbleData[group_name] = {})
  const { votes, gameData } = groupData
  
  if (votes) {
    const message = {
      sender_id: GAME,
      recipient_id: sender_id,
      subject: "votes",
      content: anonymizeVotes(votes)
    }

    sendMessageToUser(message)
  }

  if (gameData) {
    const message = {
      sender_id: GAME,
      recipient_id: sender_id,
      subject: "gameData",
      content: gameData
    }

    sendMessageToUser(message)
  }
}


const anonymizeVotes = votes => {
  const votesCast = Object.entries(votes)
  return votesCast.reduce((votesCast, [ pack, votes ]) => {
    votesCast[pack] = votes.length
    return votesCast
  }, {})
}


const treatVote = ({ sender_id, content }) => {
  const { group_name, pack_name } = content

  // Find the votes cast by members of group group_name
  const groupData = dobbleData[group_name]
                || (dobbleData[group_name] = {})
  const votes     = groupData["votes"]
                || (groupData["votes"] = {})

  // Remove any existing votes cast by sender_id
  Object.values(votes).some( votes => {
    const index = votes.indexOf(sender_id)
    if (index !== -1) {
      votes.splice(index, 1)
      return true
    }
  })

  // Cast this (new) vote by sender_id
  const packVotes = votes[pack_name]
                || (votes[pack_name] = [])
  packVotes.push(sender_id)

  content = anonymizeVotes(votes)

  // Tell all the members of the group about it
  const message = {
    sender_id: GAME,
    recipient_id: group_name,
    subject: "votes",
    content
  }

  sendMessageToGroup(message)
}


const createGameData = pack_name => {
  const pack = packData.find(
    pack => pack.name === pack_name
  )
  const { index, count } = pack
  const gameData = require(`${publicPath}${index}`)

  const randomIndices = Array
    .from(
      {length: count},
      (_, index) => index
    )
  shuffle(randomIndices)
  
  gameData.randomIndices = randomIndices
  gameData.index = 0
  gameData.root = index.replace(/\/[^/]+$/, "/")

  return gameData
}


const selectPack = ({ content }) => {
  const { group_name, pack_name } = content

  const groupData = dobbleData[group_name]
                || (dobbleData[group_name] = {})

  content = createGameData(pack_name)

  // Save for future group members
  groupData.gameData = content
  
  // Send game data to all the members of the group
  const message = {
    sender_id: GAME,
    recipient_id: group_name,
    subject: "gameData",
    content
  }

  sendMessageToGroup(message)
}


addMessageListener([
  { recipient_id: GAME, callback: treatGameMessages },
  { subject: "join_group", callback: joinGroup }
])