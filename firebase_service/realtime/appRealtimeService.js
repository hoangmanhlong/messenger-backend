import { admin } from "../firebaseService.js"
import Constant from "../../constant/constant.js"

var realtimeDB = admin.database()
var privateUserDataRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_PRIVATE_USER_DATA_REF_NAME)
const chatRoomsRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME)

let privateUserData = null

privateUserDataRef.on('value', async (snapshot) => {
  privateUserData = snapshot.val()
})

async function setUserOnlineStatus(uid, status) {
  try {
    privateUserDataRef.child(uid).child(Constant.ONLINE).set(status)
  } catch (e) {
    console.log(e)
  }
}

async function setVerifiedStatus(uid, status) {
  try {
    privateUserDataRef.child(uid).child(Constant.VERIFIED).set(status)
  } catch (e) {

  }
}

async function getUsersInChatRoom(chatroomID) {
  try {
    const snapshot = await chatRoomsRef
      .child(chatroomID)
      .child(Constant.FIREBASE_REALTIME_DATABASE_MEMBERS_REF_NAME)
      .get()
    return snapshot.val()
  } catch (e) {
    return null
  }
}

async function getTokens(members) {
  try {
    if (!privateUserData || !members) return null

    // Sử dụng Object.keys() để lấy danh sách các userId trong privateUserData
    let res = []
    for(let [k, v] of Object.entries(privateUserData)) {
      if (members.includes(k) && v?.fcmToken && v.verified && !v.online) {
        res.push(v?.fcmToken)
      }
      if (res.length === members.length) {
        break
      }
    }
    return res
  } catch (e) {
    console.log(e);
    return null;
  }
}

export { setUserOnlineStatus, setVerifiedStatus, getUsersInChatRoom, getTokens }