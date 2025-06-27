import dotenv from "dotenv";
dotenv.config();
export default{
    port: process.env.PORT || 3000 as number,
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
    },
    stripe: {
        publicKey: process.env.STRIPE_PUBLIC_KEY as string,
        secretKey: process.env.STRIPE_SECRET_KEY as string,
    }
};