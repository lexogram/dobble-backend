/**
 * server/game/index.js
 */

const GAME = "game"


const {
  addMessageListener,
  removeMessageListener,
  sendMessageToUser,
  sendMessageToGroup,
  getUserNameFromId
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
    // case "join_group": // called directly from treatMessage
    //   return joinGroup(messageData)
    case "vote":
      return treatVote(messageData)
    case "select_pack":
      return selectPack(messageData)
    case "match":
      return scoreMatch(messageData)
    case "request_next_card":
      return requestNextCard(messageData)
  }

  return false // not handled
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

  return true // message was handled
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

  return true // message was handled
}


const createGameData = (pack_name, delay) => {
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

  gameData.last = count - 2
  gameData.randomIndices = randomIndices
  gameData.index = 0
  gameData.nextIndex = 1 // so owner can click Next Card at start
  gameData.root = index.replace(/\/[^/]+$/, "/images/")
  gameData.delay = delay

  return gameData
}


const selectPack = ({ content }) => {
  const { group_name, pack_name, delay } = content

  const groupData = dobbleData[group_name]
                || (dobbleData[group_name] = {})

  content = createGameData(pack_name, delay)

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

  return true // message was handled
}


const scoreMatch = ({ sender_id, content }) => {
  const { href, group_name } = content
  const gameData = dobbleData[group_name].gameData
  const { index, randomIndices, images, cardData } = gameData

  if (index < 0 || isNaN(index)) {
    // Someone has already found the match, or the game is over.
    // Ignore the incoming message.

  } else {
    // Find the file name of the images that match
    const images1 = cardData[randomIndices[index]]
                    .images
                    .map( image => image.imageIndex)
    const images2 = cardData[randomIndices[index + 1]]
                    .images
                    .map( image => image.imageIndex)
    const imageIndex = images1.find(
      index => images2.indexOf(index) + 1
    )
    const match = images[imageIndex].source

    if (href === match) {
      // User sender_id is the first to find the match
      data = { gameData, sender_id, group_name, href }
      acknowledgeMatch(data)
    }

    return true // message was handled
  }
}


const acknowledgeMatch = ({
  gameData,
  sender_id,
  group_name,
  href
}) => {
  const user_name = getUserNameFromId(sender_id)

  let index = gameData.index + 1
  if (index > gameData.last) {
    index = "game_over"
  }

  // Prevent any other player from claiming the same match
  gameData.index = -1
  // This will be reset after the timeOut call to showNextCard

  const score = gameData.score
            || (gameData.score = {})
  score[sender_id] = (score[sender_id] || 0) + 1

  const content = {
    href,
    user_name,
    score
  }

  sendMessageToGroup({
    sender_id: "game",
    recipient_id: group_name,
    subject: "match_found",
    content
  })

  if (isNaN(gameData.delay)) {
    // Wait for the group owner to click on Next Card
    gameData.nextIndex = index

  } else {
    setTimeout(
      showNextCard,
      gameData.delay,

      gameData,
      group_name,
      index
    )
  }
}


const requestNextCard = ({ content: group_name }) => {
  const gameData = dobbleData[group_name].gameData
  const index = gameData.nextIndex

  showNextCard(gameData, group_name, index)

  return true // message was handled
}


const showNextCard = (gameData, group_name, content) => {
  gameData.index = content
  gameData.nextIndex = (content === gameData.last)
   ? "game_over"
   : (content + 1)

  // content will be next index to randomIndices or 'game_over'
  sendMessageToGroup({
    sender_id: "game",
    recipient_id: group_name,
    subject: "show_next_card",
    content
  })
}


addMessageListener([
  { recipient_id: GAME, callback: treatGameMessages },
  { subject: "join_group", callback: joinGroup }
])
