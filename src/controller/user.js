import User from "../model/user.js";
import { cloudinary } from "../helpers/cloudinary.config.js";

// CRUD operations

// function to get all users
export const getAllUsers = async (req, res) => {
    try {
        const user = await User.find().select("-password");
        res.json({success: true, message: "Users fetched successfully", user})
    } catch (err) {
        res.status(500).json({success: false, message: err.message})
    }
}
// function to get one user
export const getOneUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById({_id: userId})
        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.json({success: true, message: "User fetched successfully", user})
    } catch (err) {
        res.status(500).json({success: false, message: err.message})
    }
}
// function to update user
export const updateUser = async (req, res) => {
    try {
        const { firstname,lastname, password,email,} = req.body;
        const { userId } = req.user._id;
        const imageFile = req.file;

        // find the userById from the user
        const user = await User.findById({_id: userId})
        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
    

        const updateUserData = {
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            email: email || user.email,
            password: password || user.password,
            
        };
        if(imageFile){
            // Delete image from cloudinary
            if(user.image && user.imagePublicId) {
                await cloudinary.uploader.destroy(user.imagePublicId);
            }
            // upload new image to cloudinary
            const imageResult = await cloudinary.uploader.upload(imageFile.path);
            updateUserData.image = imageResult.secure_url;
            updateUserData.imagePublicId = imageResult.public_id;
        }



    // Update user data

        // update the fields
        user.firstname = name ||user.firstname
        user.lastname = name ||user.lastname
        user.email = email || user.email
        user.password = password || user.password

        // save the updatedUser
        const updateUser = await user.save();
        res.json({success: true, message: "User fetched successfully", updatedUser})
    } catch (err) {
        console.log("Error updating user", err.message)
        res.status(500).json({success: false, error: "Internal server error", message: err.message})
    }
}
// function to delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.deleteOne({_id: userId})
        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.json({success: true, message: "User deleted successfully", user})
    } catch (err) {
        console.log("Error deleting user", err.message)
        res.status(500).json({success: false, error: "Internal server error", message: err.message})
    }
}