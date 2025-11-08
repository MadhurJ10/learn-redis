import express, { json } from "express";
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

app.get('/', rateLimiter(5, 5), async (req, res) => {

    try {
        const resss = await hehe();
        res.send(resss);
    } catch (error) {
        console.log("erororoororor");
    }
})

app.get('/cache-aside', async (req, res) => {

    const key = 'cache-aside'

    // await redis.del(key)
    const cached = await redis.get(key);
    if (cached) {
        return res.send("get from cached");
    }

    const data = await getDb();

    await redis.set(key, JSON.stringify(data));


    return res.send("djkasbdjkasbkdna");
})


app.post('/setpost', async (req, res) => {
    try {
        const { product } = req.body;


        const saaave = await save.db(product);


        if (saaave) {
            await redis.del('productss');

            await redis.set('productss', saaave);
        }

        res.send('save new product to db and updated cache');
    } catch (error) {

    }
})


app.post('/write-through', async (req, res) => {
    try {
        const { user } = req.body;

        // ✅ 1) Write to DB
        const updatedUser = await save.db(user);   // update in DB

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        // ✅ 2) Write to cache (Write-Through)
        await redis.set(
            `user:${updatedUser.id}`,          // ✅ Use unique key
            JSON.stringify(updatedUser),       // ✅ Stringify
            { EX: 3600 }                       // ✅ TTL (optional)
        );

        return res.send("✅ DB + Cache updated (Write-Through)");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});




app.listen(3000, () => {
    console.log("server started at 3000");
})