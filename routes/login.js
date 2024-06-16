import express from "express";
import { isValidEmail, isValidPassword, hashcodeData } from "../validate/app_validate.js";
import { saveAccount, checkUserExist, getUser, updateTokenToUserData } from "../db/index.js";
import { generateAccessToken, generateRefreshToken } from "../jwt/index.js";

const route = express.Router();

route.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // TODO kiểm tra password với database
        if (!email || !password || !isValidEmail(email) || !isValidPassword(password))
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

route.post('/register', async (req, res) => {
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
        // const passwordHash = await hashcodeData("password");
        // if (!passwordHash) return res.status(400).json({ error: "Error" });
        await saveAccount({ email, password });

        // Respond with success
        res.sendStatus(200);
    } catch (e) {
        // Log the error for debugging
        console.error(e);

        // Respond with a generic error message
        return res.status(500).json({ error_message: e });
    }
});

/**
 * người dùng mãi mãi chỉ cần nhấp vào nút gửi yêu cầu, tạo mã thông báo truy cập vô hạn cho người
 * dùng bất kể điều gì và miễn là họ có điều đó  mã thông báo làm mới họ có thể làm điều đó vì vậy
 * để ngăn chặn điều này, chúng tôi cần có một số dạng chức năng xóa, chúng tôi sẽ gọi đây là xóa ở
 * đây và chúng tôi muốn thực hiện việc đăng xuất chẳng hạn và điều này sẽ cho phép chúng tôi làm gì?
 * thực ra là xóa các mã thông báo làm mới đó và xóa chúng khỏi một số cơ sở dữ liệu nhưng
 */
route.delete('/logout', (req, res) => {
    const { email, refresh_token } = req.body;
    // xóa refresh_token khỏi database
    res.sendStatus(204);
});

export default route