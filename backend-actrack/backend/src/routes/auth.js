import express from "express";
import { register, login, getProfile, logout, refresh } from "../controllers/authController.js";
import { protect } from '../middlewares/authMiddleware.js'
import passport from "passport";
import { cookieOptions } from "../utils/authUtils.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh)
router.get('/profile', protect, getProfile);


router.get('/google', passport.authenticate('google', {scope: ['profile', 'email'] , session : false}))
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        res.cookie('token', req.user.token, cookieOptions)
        res.redirect('http://localhost:5173/home')
    }
)


export default router;

