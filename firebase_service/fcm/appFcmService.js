import { getMessaging } from "firebase-admin/messaging";

const sendTopicMessage = (message) => {
    getMessaging().send(message)
        .then(response => { })
        .catch(error => { })
}

const sendMessageWithToken =  async (messageData, token) => {
    const message = {
        data: messageData,
        token: token
    }
    getMessaging().send(message)
}

const sendMessageToUsers = async (mesageData, tokens) => {
    if(tokens == null) return
    tokens.forEach(token => {          
        try {
            sendMessageWithToken(mesageData, token)
        } catch(e) {
            console.log(e)
        }
    });
}

export { sendMessageWithToken, sendMessageToUsers }