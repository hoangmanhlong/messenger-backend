import 'dotenv/config'
import express from 'express'

const app = express()
app.use(express.json())

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello world <3')
})

app.listen(port, () => console.log(`Server is running on port ${port}`))