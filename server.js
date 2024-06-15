import "dotenv/config";
import express from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verityAccessToken,
} from "./jwt/index.js";
import admin from "firebase-admin";
import {
  saveAccount,
  checkUserExist,
  getUser,
  updateTokenToUserData,
} from "./db/index.js";
import {
  isValidEmail,
  isValidPassword,
  hashcodeData,
} from "./validate/app_validate.js";

// khởi tạo ứng dụng express
const app = express();
// sử dụng phân tích cú pháp json
app.use(express.json());

/**
 * Provide credentials using Google Application Default Credentials (ADC)
 * link: https://firebase.google.com/docs/cloud-messaging/migrate-v1#provide-credentials-using-adc
 */
const serviceAccount = admin.credential.applicationDefault();

admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount), // use in case serviceAccount is path to Application Default Credentials (.env)
  credential: serviceAccount,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

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

const port = process.env.PORT || 3000;

const authorization = (req, res, next) => verityAccessToken(req, res, next);

app.get("/", (req, res) => {
  res.send("Hello world <3");
});

/**
 * người dùng mãi mãi chỉ cần nhấp vào nút gửi yêu cầu, tạo mã thông báo truy cập vô hạn cho người
 * dùng bất kể điều gì và miễn là họ có điều đó  mã thông báo làm mới họ có thể làm điều đó vì vậy
 * để ngăn chặn điều này, chúng tôi cần có một số dạng chức năng xóa, chúng tôi sẽ gọi đây là xóa ở
 * đây và chúng tôi muốn thực hiện việc đăng xuất chẳng hạn và điều này sẽ cho phép chúng tôi làm gì?
 * thực ra là xóa các mã thông báo làm mới đó và xóa chúng khỏi một số cơ sở dữ liệu nhưng
 */
app.delete("/logout", (req, res) => {
  const { email, refresh_token } = req.body;
  // xóa refresh_token khỏi database
  res.sendStatus(204);
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (
      !email ||
      !password ||
      !isValidEmail(email) ||
      !isValidPassword(password)
    ) {
      return res.status(400).json({ message: "Input is invalidate" });
    }

    // Check if user already exists
    const isUserExist = await checkUserExist(email);
    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Save the new user
    const passwordHash = await hashcodeData("password");
    if (!passwordHash) return res.status(400).json({ error: "Error" });
    await saveAccount({ email, password: passwordHash });

    // Respond with success
    res.sendStatus(200);
  } catch (e) {
    // Log the error for debugging
    console.error(e);

    // Respond with a generic error message
    return res.status(500).json({ error_message: e });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // TODO kiểm tra password với database
    if (
      !email ||
      !password ||
      !isValidEmail(email) ||
      !isValidPassword(password)
    )
      return res.sendStatus(400);
    const user = { email, password };
    let userdata = await getUser(user);
    if (!userdata)
      return res.status(400).json({ error: "Email or password incorrect" });
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user),
      generateRefreshToken(user),
    ]);
    if (!accessToken || !refreshToken) return res.sendStatus(400);
    userdata = await updateTokenToUserData(email, accessToken, refreshToken);
    if (!userdata) return res.status(400).json({ error: "update failure" });
    res.json({
      data: {
        userdata: userdata,
      },
    });
  } catch (e) {
    return res.status(400).json({ error_message: e });
  }
});

app.get("/profile", authorization, async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) return res.status(400).json({ error: "Email not exsit" });
    const userdata = await getUser({ email });
    if (!userdata)
      return res.status(400).json({ error: "Profile not available" });
    res.json({ data: userdata });
  } catch (e) {
    return res.status(400).json({ error_message: e });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
