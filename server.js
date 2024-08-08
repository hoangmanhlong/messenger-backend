import "dotenv/config";
import "./firebase_service/firebaseService.js";
import express from "express";
import route from "./routes/controller.js";
import morgan from "morgan";
import { connectDB } from "./db/db.js";
import { initializeSocket } from "./socket/socket.js";
import { createServer } from 'node:http';
import Constant from "./constant/constant.js";

// connectDB()

const port = process.env.SERVER_PORT || 6688;

// khởi tạo ứng dụng express
const app = express();
// sử dụng phân tích cú pháp json
app.use(express.json());
app.use(morgan('combined'))

const server = createServer(app);
initializeSocket(server)

app.get("/", (req, res) => res.send(Constant.SERVER_ENDPOINT_CONNECT_MESSAGE));
app.use("/api", route);

server.listen(port, () => Constant.showRunningStatus(port));