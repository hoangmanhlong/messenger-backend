import { getMessaging } from "firebase-admin/messaging";

const sendTopicMessage = (message) => {
    getMessaging().send(message)
        .then(response => { })
        .catch(error => { })
}

const sendMessageWithToken = (messageData, token) => {
    const message = {
        data: messageData,
        token: token
    }
    getMessaging().send(message)
        .then(response => { })
        .catch(error => { })
}