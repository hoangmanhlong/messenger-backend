import admin from "firebase-admin";

/**
 * Provide credentials using Google Application Default Credentials (ADC)
 * link: https://firebase.google.com/docs/cloud-messaging/migrate-v1#provide-credentials-using-adc
 */
const serviceAccount = admin.credential.applicationDefault();

try {
  admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount), // use in case serviceAccount is path to Application Default Credentials (.env)
    credential: serviceAccount,
    databaseURL: process.env.FIREBASE_REALTIME_DATABASE_URL,
  });
} catch (error) {
  console.log(error);
}

/**
 * Use your Firebase credentials together with the Google Auth Library for your preferred language 
 * to retrieve a short-lived OAuth 2.0 access token
 * 
 * link: https://firebase.google.com/docs/cloud-messaging/migrate-v1#use-credentials-to-mint-access-tokens
 * @returns 
//  */
function getAccessToken() {
  return new Promise(function (resolve, reject) {
    const key = serviceAccount;
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

export { admin }