import User from "../model/user.js"; 
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { cloudinary } from "../helpers/cloudinary.config.js";



dotenv.config();

export const signup = async (req, res) => {
    try {
      const { firstname, lastname, email, password } = req.body;
      const imageFile = req.file;
  
      if (!firstname || !lastname) {
        return res.status(400).json({ error: "Name is required" });
      }
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email is taken" });
      }
  
      const hashedPassword = await hashPassword(password);


      let uploadedImage = {};
      if (imageFile) {
      
            try {
              const imageResult = await cloudinary.uploader.upload(imageFile.path);
              uploadedImage.url = imageResult.secure_url,
              uploadedImage.imagePublicId = imageResult.public_id
            } catch (err) {
              console.error("Error uploading image to Cloudinary:", err);
              return {
                error: "Failed to upload image",
              };
            }
      }

      const user = new User({
        firstname,
        lastname,
        email,
        image: uploadedImage,
        password: hashedPassword,
      });

    
      await user.save();

    
    // create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

  
      res.json({
        success: true,
        message: "User registered successfully",
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          token,
          avatar: user.image
          
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  };


  export const signin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(400).json({ error: "Wrong password" });
      }
  
      // create token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
  
      res.json({
        success: true,
        message: "User signin successfully",
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          avatar: user.image,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  };
  
  export const forgotPassword = async (req, res)=>{
    try {
      const { email } = req.body
  
      if(!email) {
        return res.status(400).json({message: "Email is required"})
      }
  
      // find user by email
      const user = await User.findOne({email});
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
  
      // Generate password reset token
      const resetToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3h"});
  
  
      // send reset token to user's email address
      const domain = "www.maureen.com";
      const resetLink = `${domain}/reset/${resetToken}`
  
      // send response including the reseToken
      return res.json({ message: "Password reset token generated successfully", resetToken });
  
    } catch (err){
      console.log(err);
      return res.status(500).json({ success: false,  message: "Failed to create reset token" });
    }
      
    }
  
  // resetPassword function
  export const resetPassword = async(req, res) => {
    try {
      const { newPassword } = req.body;
  
      const resetToken = req.headers.authorization
  
      if(!newPassword){
        return res.status(400).json({success: false, message: 'Enter new password'})
      }
      if(!resetToken || !resetToken.startsWith("Bearer")){
        return res.status(401).json({success: false, message: 'invalid token or no reset token provided'}) 
      }
  
      //get token without the "Bearer"
      const token = resetToken.split(" ")[1]
      // console.log(token);
  
      // verify the token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  
      // console.log(decodedToken);
  
      if(!decodedToken){
        return res.status(403).json({success: false, message: "Invalid/expired token provided"})
      }
      const userId = decodedToken.userId
      // console.log(userId);
  
      //find user by userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ error: "Invalid user" });
      }
  
      const hashedPassword = await hashPassword(newPassword);
  
      user.password = hashedPassword;
  
      // save user (including the new password)
      await user.save();
  
      res.json({success: true, message: "Password reset successfully" });
  
      
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({success: false, message: "Password reset failed", error: err.message});
      
    }
  }