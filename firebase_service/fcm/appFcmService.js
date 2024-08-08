import { getMessaging } from "firebase-admin/messaging";

const sendMessageWithToken =  async (messageData, token) => {
    const message = {
        data: messageData,
        token: token
    }
    try {
        getMessaging().send(message)
    } catch(e) {
        console.error(e)
    }
}

const sendMessageToUsers = async (mesageData, tokens) => {
    if(tokens == null) return
    tokens.forEach(token => sendMessageWithToken(mesageData, token));
}

export { sendMessageToUsers }