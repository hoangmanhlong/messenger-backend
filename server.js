import 'dotenv/config'
import express from 'express'
import { generateAccessToken, generateRefreshToken, verityAccessToken } from './jwt/index.js'

// khởi tạo ứng dụng express
const app = express()
// sử dụng phân tích cú pháp json
app.use(express.json())

const port = process.env.PORT || 3000

const users_info = []

const authorization = (req, res, next) => verityAccessToken(req, res, next)

app.get('/', (req, res) => {
    res.send('Hello world <3')
})

/**
 * người dùng mãi mãi chỉ cần nhấp vào nút gửi yêu cầu, tạo mã thông báo truy cập vô hạn cho người 
 * dùng bất kể điều gì và miễn là họ có điều đó  mã thông báo làm mới họ có thể làm điều đó vì vậy
 * để ngăn chặn điều này, chúng tôi cần có một số dạng chức năng xóa, chúng tôi sẽ gọi đây là xóa ở 
 * đây và chúng tôi muốn thực hiện việc đăng xuất chẳng hạn và điều này sẽ cho phép chúng tôi làm gì?
 * thực ra là xóa các mã thông báo làm mới đó và xóa chúng khỏi một số cơ sở dữ liệu nhưng
 */
app.delete('/logout', (req, res) => {
    const {email, refresh_token} = req.body
    // xóa refresh_token khỏi database
    res.sendStatus(204)
})

app.post('/login', async (req, res) => {
    const {email, password} = req.body
    // TODO kiểm tra password với database
    if(!email || !password) return res.sendStatus(400)
    const user = {email, password}
    const [accessToken, refreshToken] = await Promise.all([
        generateAccessToken(user),
        generateRefreshToken(user)
    ]);
    if(accessToken == null || refreshToken == null) return res.sendStatus(400)
    users_info.push(user)
    res.json({ accessToken, refreshToken })
})

app.get('/profile', authorization,  async (req, res) => {
    res.json({email: users_info.filter(data => data.email === req.data.email)[0].email})
})

app.listen(port, () => console.log(`Server is running on port ${port}`))