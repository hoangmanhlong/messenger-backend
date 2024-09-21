import { Server } from "socket.io"
import Constant, { ChatRoomType } from "../constant/constant.js"
import { setUserOnlineStatus, getUsersInChatRoom, getTokens, createNewChatRoom, addNewMembers } from "../firebase_service/realtime/appRealtimeService.js"
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

        /**
         * New members listener
         */
        socket.on(Constant.NEW_CHATROOM_MEMBERS_SOCKET_EVENT, async data => handleNewMembers(socket, data))
    })

    console.log(Constant.SOCKET_IO_CONNECT_SUCCESSFULLY)
}

async function handleNewMessageEvent(data) {
    // Convert Json object or Json string to JSON object
    const parsedData = parseStringToJSON(data)

    // Check parsedData is validate
    if (parsedData) {

        const { chatRoomId, chatRoomName, chatRoomType, newMessage, members } = parsedData

        // Check chatRoomId, chatRoomId are validate
        if (chatRoomId && chatRoomName && chatRoomType) {

            const { senderId, senderName, text, medias } = parseStringToJSON(newMessage)

            // Check that the data is valid. The message content must have a non-null field.
            if (senderId && senderName && (text || medias)) {

                // 
                const listOfUidsOfUsersInchatRoom = (members != null && members.length >= Constant.MIN_SIZE_OF_CHATROOM) ? members : await getUsersInChatRoom(chatRoomId)

                // Check list of uids of user is valid
                if (listOfUidsOfUsersInchatRoom != null && listOfUidsOfUsersInchatRoom.length >= Constant.MIN_SIZE_OF_CHATROOM) {

                    // Delete sender uid from uid list - The sender will not receive his own messages.
                    const listOfNotifiedUsers = listOfUidsOfUsersInchatRoom.filter(id => id !== senderId)

                    // Get list of tokens from list of user uid
                    const tokens = await getTokens(listOfNotifiedUsers)

                    // Send new messages to users according to token list
                    sendMessageToUsers({
                        chatRoomId: chatRoomId,
                        chatRoomName: chatRoomName,
                        chatRoomType: chatRoomType,
                        senderName: senderName,
                        text: text || "",
                        medias: medias ? JSON.stringify(medias) : ""
                    }, tokens)
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
    if (!parsedData) {
        emitChatRoomResponse(socket, 500, null)
        return
    }

    const { members, chatRoomType } = parsedData

    if (!members
        || !Array.isArray(members)
        || members.length < 2
        || !chatRoomType
        || typeof chatRoomType !== 'string'
        || !Object.values(ChatRoomType).includes(chatRoomType)
        || !members.every(member => typeof member === 'string')
        || (chatRoomType === ChatRoomType.DOUBLE && members.length > 2)
        || (chatRoomType === ChatRoomType.GROUP && members.length < 3)
    ) {
        emitChatRoomResponse(socket, 500, null)
        return
    }

    // Create chat room in database
    const chatRoom = await createNewChatRoom(members, chatRoomType)

    emitChatRoomResponse(socket, chatRoom == null ? 500 : 200, chatRoom)
}

/**
 * Emit new chat room to NEW_CHATROOM_SOCKET_EVENT to current socket
 * 
 * @param {*} socket socket of current user
 * @param {*} responseStatusCode status code of work
 * @param {*} chatRoom new chatroom created
 */
function emitChatRoomResponse(socket, responseStatusCode, chatRoom) {
    socket.emit(Constant.NEW_CHATROOM_SOCKET_EVENT, { responseStatusCode, chatRoom })
}

async function handleNewMembers(socket, data) {
    const parsedData = parseStringToJSON(data)

    if(!parsedData) {
        emitNewMembersResponse(socket, 500)
        return
    }

    const { chatRoomId, members } = parsedData

    if(!chatRoomId || !members || members.length <= 0) {
        emitNewMembersResponse(socket, 500)
        return
    }

    const result = addNewMembers(chatRoomId, members)
    emitNewMembersResponse(socket, result ? 200 : 500)
}

function emitNewMembersResponse(socket, responseStatusCode) {
    socket.emit(Constant.NEW_CHATROOM_MEMBERS_SOCKET_EVENT, { responseStatusCode })
}

export default io
export { initializeSocket }