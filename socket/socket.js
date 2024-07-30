import { Server } from "socket.io"
import Constant from "../constant/constant"
import { setUserOnlineStatus } from "../firebase_service/realtime/appRealtimeService"

let io = null

const socketIDUserDataUidList = {}

const initializeSocket = (server) => {
    io = new Server(server)
    io.on('connection', (socket) => {
        const socketId = socket.id
        socket.on(Constant.USER_ONLINE_STATUS_SOCKET_EVENT, (data) => {
            const { uid } = data
            socketIDUserDataUidList[socketId] = uid
            setUserOnlineStatus(uid, true)
        })

        socket.on('Disconnect', () => {
            setUserOnlineStatus(socketIDUserDataUidList[socketId], false)
            delete socketIDUserDataUidList[socketId]
        })
    })
    console.log('socket.io initialize successfully')
}

export default io
export { initializeSocket }