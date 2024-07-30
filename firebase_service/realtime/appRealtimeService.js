import { admin } from "../firebaseService";

var realtimeDB = admin.database();
var privateUserDataRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_PRIVATE_USER_DATA_REF_NAME);

async function setUserOnlineStatus(uid, status) {
  privateUserDataRef.child(uid).child(Constant.ONLINE).set(status)
}

export { setUserOnlineStatus }