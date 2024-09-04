import { admin } from "../firebaseService.js"
import Constant, { ChatRoomType, ContactStatus } from "../../constant/constant.js"
import getCurrentTime from "../../time/TimeUtils.js"

var realtimeDB = admin.database()
var secureUserDataRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_SECURE_USER_DATA_REF_NAME)
const privateUserDataRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_PRIVATE_USER_DATA_REF_NAME)
const chatRoomsRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME)

let secureUserData = null

secureUserDataRef.on('value', async (snapshot) => {
  secureUserData = snapshot.val()
})

async function setUserOnlineStatus(uid, status) {
  try {
    secureUserDataRef.child(uid).child(Constant.ONLINE).set(status)
  } catch (e) {
    console.log(e)
  }
}

async function setVerifiedStatus(uid, status) {
  try {
    secureUserDataRef.child(uid).child(Constant.VERIFIED).set(status)
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
    if (!secureUserData || !members) return null

    // Sử dụng Object.keys() để lấy danh sách các userId trong privateUserData
    let res = []
    for (let [k, v] of Object.entries(secureUserData)) {
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

/**
 * Create new chatroom
 * 
 * @param members member uid list
 * @param chatRoomType chatRoom Type (detail: Constant.ChatRoomType)
 * 
 * @returns New chat room just created
 */
async function createNewChatRoom(members, chatRoomType) {
  let chatroom = null
  try {
    if (chatRoomType === ChatRoomType.DOUBLE) {

      // Chat room Id are set according to the convention user1___user2
      const chatRoomId = members.join("___")

      // Create a chatroom object
      chatroom = {
        chatRoomId: chatRoomId,
        members: members,
        chatRoomType: ChatRoomType.DOUBLE
      }

      // Update new chat room to Database
      await chatRoomsRef.child(chatRoomId).set(chatroom)

      // Update new chat rooms to each user's chatroom and contact list
      await Promise.all(members.map(async (memberUid) => {

        // Get all chatroom list of current user
        const snapshot = await privateUserDataRef
          .child(memberUid)
          .child(Constant.FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME)
          .get();

        // Save chatroom Id list. IF snapshot is null then create empty list
        const chatRoomListOfMember = snapshot.val() || [];

        // Thêm chatroom mới vào danh sách~
        chatRoomListOfMember.push(chatRoomId);

        // Cập nhật lại danh sách chat rooms lên Firebase
        privateUserDataRef
          .child(memberUid)
          .child(Constant.FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME)
          .set(chatRoomListOfMember);

        // Add the opposite user to the contact list
        const oppositeUserId = members.find(uid => uid !== memberUid)
        privateUserDataRef
          .child(memberUid)
          .child(Constant.CONTACTS)
          .child(oppositeUserId)
          .set({ uid: oppositeUserId, status: ContactStatus.ACTIVE })
      }));
    } else if (chatRoomType === ChatRoomType.GROUP) {

      // Chat room Id are set according to the convention user1___user2___user3___currentTime
      const chatRoomId = `${members.slice(0, 3).join("___")}___${getCurrentTime()}`

      // Create a chatroom object
      chatroom = {
        chatRoomId: chatRoomId,
        members: members,
        chatRoomType: ChatRoomType.GROUP
      }

      // Update new chat room to Database
      await chatRoomsRef.child(chatRoomId).set(chatroom)

      // Update new chat rooms to each user's chatroom and contact list
      await Promise.all(members.map(async (memberUid) => {

        // Get all chatroom list of current user
        const snapshot = await privateUserDataRef
          .child(memberUid)
          .child(Constant.FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME)
          .get();

        // Save chatroom Id list. IF snapshot is null then create empty list
        const chatRoomListOfMember = snapshot.val() || [];

        // Thêm chatroom mới vào danh sách~
        chatRoomListOfMember.push(chatRoomId);

        // Cập nhật lại danh sách chat rooms lên Firebase
        privateUserDataRef
          .child(memberUid)
          .child(Constant.FIREBASE_REALTIME_DATABASE_CHATROOMS_REF_NAME)
          .set(chatRoomListOfMember);
      }));
    } else {

    }
    return chatroom
  } catch (e) {
    return null
  }
}

export { setUserOnlineStatus, setVerifiedStatus, getUsersInChatRoom, getTokens, createNewChatRoom }