import express from "express";
import redis from "./redisConfig.js";
import { rateLimiter } from "./ratelimit.js";


const app = express();

function getDb() {
    return [
        { name: "madhur" },
        { name: "sarva" }
    ]
}

const hehe = async () => {
    try {
        const key = "user";

        const cached = await redis.get(key);

        if (cached) {
            console.log("from redis");
            return cached;
        }

        console.log("from db");

        const data = await getDb();

        await redis.set(key, JSON.stringify(data), 'EX', 60);

        return data;

    } catch (error) {
        console.log(error);
        return error
    }
}

app.get('/', rateLimiter(5 , 5) , async (req, res) => {

    try {
            const resss = await hehe();
    res.send(resss);
    } catch (error) {
        console.log("erororoororor");
    }
})



app.listen(3000, () => {
    console.log("server started at 3000");
})