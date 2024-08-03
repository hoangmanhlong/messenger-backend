import { Server } from "socket.io"
import Constant from "../constant/constant.js"
import { setUserOnlineStatus, setVerifiedStatus } from "../firebase_service/realtime/appRealtimeService.js"
import { parseStringToJSON } from "../validate/app_validate.js"

// Socket IO instance is attached server
let io = null

// Danh sách các socket ID với UID của người dùng
// Example: {socket1: "uvuvfrg8v5785gbug"}
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
         * User online status listener
         * 
         * @param data Json object or Json string from client
         */
        socket.on(Constant.USER_ONLINE_STATUS_SOCKET_EVENT, async (data) => {

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
        })

        /**
         * Add Disconnect listener when client disconnect
         */
        socket.on('disconnect', async () => {

            // Get uid of current socket instance in socketIDUserDataUidList
            const uid = socketIDUserDataUidList[socketId];

            // Check uid is validate
            if (uid) {

                // Update online status to Database
                setUserOnlineStatus(uid, false);

                // Delete socket from socketIDUserDataUidList
                delete socketIDUserDataUidList[socketId];
            }
        })

        socket.on(Constant.NEW_MESSAGE_SOCKET_EVENT, async (data) => {

        })
    })
    console.log(Constant.SOCKET_IO_CONNECT_SUCCESSFULLY)
}

export default io
export { initializeSocket }