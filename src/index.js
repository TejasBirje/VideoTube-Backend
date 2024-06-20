// require('dotenv').config()
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed !!! in index.js" ,err);
})








/*
import express from "express"
const app = express()

// IIFE , semi-colon is for cleaning if line before is not ended with semi-colon
;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR:" ,error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on Port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR in index.js: ", error);
        throw error;
    }
})()

*/