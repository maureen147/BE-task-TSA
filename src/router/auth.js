import express from 'express';
import { signup, signin, forgotPassword, resetPassword } from '../controller/auth.js';
import { upload } from '../helpers/multer.js';




const router = express.Router();

// routes
router.post('/signup', upload.single('image'), signup)
router.post('/signin', signin)




// forgot password ande reset password
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)


export default router
