import { Server } from "socket.io"
import Constant, { ChatRoomType } from "../constant/constant.js"
import { setUserOnlineStatus, getUsersInChatRoom, getTokens, createNewChatRoom } from "../firebase_service/realtime/appRealtimeService.js"
import { parseStringToJSON } from "../validate/app_validate.js"
import { sendMessageToUsers } from "../firebase_service/fcm/appFcmService.js"

// Socket IO instance is attached server
let io = null

// Stores a list of user connections
const socketIDUserDataUidList = {}

const initializeSocket = async (server) => {

    // Init socket server
    io = new Server(server)

    /**
     * Add listener when user connect to Server
     * 
     * @param socket Represents a client instance connected to the server
     */
    io.on('connection', async (socket) => {

        const socketId = socket.id

        /**
         * User online status listener when client online
         * 
         * @param data Data sent from client
         */
        socket.on(Constant.USER_ONLINE_STATUS_SOCKET_EVENT, async data => handleUserOnlineStatusEvent(data, socketId))

        /**
         * Add Disconnect listener when client disconnect. Remove connected socket from socket list
         */
        socket.on('disconnect', async () => handleClientDisconnect(socketId))

        /**
         * New Message Listener - Called when there is a new message from the client
         * 
         * @param data Data sent from client
         */
        socket.on(Constant.NEW_MESSAGE_SOCKET_EVENT, async data => handleNewMessageEvent(data))

        /**
         * New ChatRoom Listener - Called when have new chat room created
         * 
         * @param data Data sent from client
         */
        socket.on(Constant.NEW_CHATROOM_SOCKET_EVENT, async data => handleNewChatRoom(socket, data))
    })

    console.log(Constant.SOCKET_IO_CONNECT_SUCCESSFULLY)
}

async function handleNewMessageEvent(data) {
    // Convert Json object or Json string to JSON object
    const parsedData = parseStringToJSON(data)

    // Check parsedData is validate
    if (parsedData) {

        const { chatRoomId, newMessage, members } = parsedData

        // Check chatRoomId, chatRoomId are validate
        if (chatRoomId && chatRoomId) {

            const { senderId, text, photo, audio, video } = parseStringToJSON(newMessage)

            // Check that the data is valid. The message content must have a non-null field.
            if (senderId && (text || photo || video || audio)) {

                // 
                const listOfUidsOfUsersInchatRoom = (members != null && members.length >= Constant.MIN_SIZE_OF_CHATROOM) ? members : await getUsersInChatRoom(chatRoomId)

                // Check list of uids of user is valid
                if (listOfUidsOfUsersInchatRoom != null && listOfUidsOfUsersInchatRoom.length >= Constant.MIN_SIZE_OF_CHATROOM) {

                    // Delete sender uid from uid list - The sender will not receive his own messages.
                    const listOfNotifiedUsers = listOfUidsOfUsersInchatRoom.filter(id => id !== senderId)

                    // Get list of tokens from list of user uid
                    const tokens = await getTokens(listOfNotifiedUsers)

                    // Send new messages to users according to token list
                    sendMessageToUsers(newMessage, tokens)
                }
            }
        }
    }
}

async function handleUserOnlineStatusEvent(data, socketId) {
    // Convert Json object or Json string to JSON object
    const parsedData = parseStringToJSON(data)

    // Check parsedData is validate
    if (parsedData) {

        // Get user uid from JSON object
        const { uid } = parsedData

        // Check uid is validate
        if (uid) {

            // Save current client socket vs current client uid
            socketIDUserDataUidList[socketId] = uid

            // Update online status to Database
            setUserOnlineStatus(uid, true)
        }
    }
}

async function handleClientDisconnect(socketId) {
    // Get uid of current socket instance in socketIDUserDataUidList
    const uid = socketIDUserDataUidList[socketId];

    // Check uid is validate
    if (uid) {

        // Update online status to Database
        setUserOnlineStatus(uid, false);

        // Delete socket from socketIDUserDataUidList
        delete socketIDUserDataUidList[socketId];
    }
}

async function handleNewChatRoom(socket, data) {
    // Convert Json object or Json string to JSON object
    const parsedData = parseStringToJSON(data)

    // Check parsedData is validate
    if (!parsedData) return

    const { members, chatRoomType } = parsedData

    if (!members 
        || !Array.isArray(members)
        || members.length < 2
        || !chatRoomType
        || typeof chatRoomType !== 'string'
        || !Object.values(ChatRoomType).includes(chatRoomType)
        || !members.every(member => typeof member === 'string')
    ) {
        socket.emit(Constant.NEW_CHATROOM_SOCKET_EVENT, { responseStatusCode: 500, chatroom: null })
        return
    }
    
    const chatroom = await createNewChatRoom(members, chatRoomType)
    socket.emit(
        Constant.NEW_CHATROOM_SOCKET_EVENT,
        { 
            responseStatusCode: chatroom == null ? 200 : 500,
            chatRoom: chatroom 
        }
    )
}

export default io
export { initializeSocket }