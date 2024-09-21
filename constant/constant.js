class Constant {
    static TOKEN_EXPIRATON_TIME = "15m"
    static SERVER_ENDPOINT_CONNECT_MESSAGE = "This is backend Messenger app"
    static FIREBASE_REALTIME_DATABASE_PUBLIC_USER_DATA_REF_NAME = "public_user_data"
    static FIREBASE_REALTIME_DATABASE_PRIVATE_USER_DATA_REF_NAME = "private_user_data"
    static FIREBASE_REALTIME_DATABASE_SECURE_USER_DATA_REF_NAME = "secure_user_data"
    static FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME = "chatRooms"
    static FIREBASE_REALTIME_DATABASE_MEMBERS_REF_NAME = "members"
    static ONLINE = "online"
    static USER_ONLINE_STATUS_SOCKET_EVENT = "USER_ONLINE_STATUS_SOCKET_EVENT"
    static USER_VERIFIED_STATUS_SOCKET_EVENT = "USER_VERIFIED_STATUS_SOCKET_EVENT"
    static VERIFIED = "verified"
    static NEW_MESSAGE_SOCKET_EVENT = "NEW_MESSAGE_SOCKET_EVENT"
    static SOCKET_IO_CONNECT_SUCCESSFULLY = "Socket.io initialize successfully"
    static MIN_SIZE_OF_CHATROOM = 2
    static NEW_CHATROOM_SOCKET_EVENT = "NEW_CHATROOM_SOCKET_EVENT"
    static NEW_CHATROOM_MEMBERS_SOCKET_EVENT = "NEW_CHATROOM_MEMBERS_SOCKET_EVENT"
    static CONTACTS = "contacts"
    static showRunningStatus = (port) => console.log(`Server is running on port ${port}`)
    static CHATROOMS = "chatRooms"
}

const ChatRoomType = Object.freeze({
    SINGLE: "0",
    DOUBLE: "1",
    GROUP: "2"
})

const ContactStatus = Object.freeze({
    ACTIVE: "0",
    BLOCKED: "1"
})

export default Constant
export { ChatRoomType, ContactStatus }