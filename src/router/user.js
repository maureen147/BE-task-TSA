import express from 'express';
import { deleteUser, getAllUsers, getOneUser, updateUser } from '../controller/user.js';

const router = express.Router();

// User routes
router.get("/users",getAllUsers)
router.get("/user/:userId",getOneUser)
router.put("/user/update",  updateUser)
router.delete("/:userId",deleteUser)



export default router