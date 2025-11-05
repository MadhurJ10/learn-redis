import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redis = new Redis({
    host: "redis-17012.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 17012,
    username: "default",
    password: process.env.REDIS_PASSWORD,
    
});

redis.on('connect', () => {
    console.log("✅ Redis connected");
});

redis.on("error", (error) => {
    console.log("❌ Redis Error");
    console.log(error);
});

export default redis;
