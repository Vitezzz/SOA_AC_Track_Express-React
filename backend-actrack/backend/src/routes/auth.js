import express from "express";
import { register,login, getProfile, logout, refresh } from "../controllers/authController.js";
import  { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh',refresh)
router.get('/profile', protect, getProfile);

export default router;

