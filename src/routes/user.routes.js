import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()  // just like we create app in express

router.route("/register").post(registerUser)  // when /register is hit, call registerUser

export default router