import { admin } from "../firebaseService.js";
import Constant from "../../constant/constant.js";

var realtimeDB = admin.database();
var privateUserDataRef = realtimeDB.ref(Constant.FIREBASE_REALTIME_DATABASE_PRIVATE_USER_DATA_REF_NAME);

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
  } catch(e) {

  }
}

export { setUserOnlineStatus, setVerifiedStatus }