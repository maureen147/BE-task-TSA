import express from "express";
import dotenv from "dotenv";
import  authRouter  from './src/router/auth.js';
import  UserRouter from './src/router/user.js';
import propertyRouter from "./src/router/property.js.js"
import morgan from "morgan";
import cors from 'cors'
import { connectDb } from "./src/db.config.js";



const app = express();

app.use(express.json());


dotenv.config();


app.get('/', (req, res) =>{
  res.json({success: true, message: 'OK'});
  ;
})

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());



//Routes
app.use("/api", UserRouter);
app.use("/api/auth", authRouter);
app.use("/api/property", propertyRouter);




const port = process.env.PORT || 3000;
const dbURL = process.env.MONGODB_URL;
console.log(dbURL);

// connect db
connectDb(dbURL);

app.listen(port, () => {
  console.log(`betahouse  listening on port ${port}!`);
});