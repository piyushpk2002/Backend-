import express from 'express';
import {signupUser, loginUser, logoutUser, refreshAccessToken} from '../controllers/userController.js';


const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshAccessToken', refreshAccessToken);

export default router;