import { Server } from "socket.io"
import Constant from "../constant/constant.js"
import { setUserOnlineStatus, setVerifiedStatus } from "../firebase_service/realtime/appRealtimeService.js"

let io = null

// Danh sách các socket ID với UID của người dùng
// Example: {socket1: "uvuvfrg8v5785gbug"}
const socketIDUserDataUidList = {}

const initializeSocket =  async (server) => {
    io = new Server(server)
    io.on('connection', async (socket) => {

        const socketId = socket.id

        socket.on(Constant.USER_ONLINE_STATUS_SOCKET_EVENT, async (data) => {
            const { uid } = data
            if(uid) {
                socketIDUserDataUidList[socketId] = uid
            setUserOnlineStatus(uid, true)
            }
        })

        socket.on('disconnect',  async () => {
            const uid = socketIDUserDataUidList[socketId];
            if (uid) {
                await setUserOnlineStatus(uid, false);
                delete socketIDUserDataUidList[socketId];
            }
        })

        socket.on(Constant.NEW_MESSAGE_SOCKET_EVENT, async (data) => {
            
        })

        // socket.on(Constant.USER_VERIFIED_STATUS_SOCKET_EVENT, async (data) => {
        //     if(!data) return
        //     const { uid, verified } = data
        //     if (!uid || typeof verified !== 'boolean') return;
        //     setVerifiedStatus(uid, verified)
        // })
    })
    console.log('socket.io initialize successfully')
}

export default io
export { initializeSocket }