import express from "express";
import { getUser } from "../db/db.js";

const route = express.Router();

route.get("/", async (req, res) => {
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

export default route