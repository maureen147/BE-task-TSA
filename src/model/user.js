import mongoose from "mongoose";
const { Schema } =  mongoose;

const userSchema = new Schema(
    {
       firstname: {
            type: String,
            required: true,
            trim: true,
        },
       lastname: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
            max: 64
        },
        image: {
            url: {
              type: String,
            },
            imagePublicId: {
              type: String,
            }
          },
    }
);

export default mongoose.model('User', userSchema)