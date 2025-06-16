import dotenv from "dotenv";
dotenv.config();
export default{
    port: process.env.PORT || 4000,
    dbUri :  process.env.MONGO_URL, 
    logLevel : "info" ,
    accessTokenPrivateKey: "",
    refreshTokenPrivateKey: "",
    smtp: {
        user: "yasmeenayr@gmail.com",
        pass: "mqtq cmng zzsk itjb", // App password
        host: "smtp.gmail.com",
        port: 465, // SSL port
        secure: true
    }
};