import { Server } from "socket.io"

let io = null

const initializeSocket = (server) => {
    io = new Server(server)
    io.on('connection', (socket) => {
        console.log(socket.id)
    })
    console.log('socket.io initialize successfully')
}

export default io
export { initializeSocket }