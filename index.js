import express, { json } from "express";
import redis from "./redisConfig.js";
import { rateLimiter } from "./ratelimit.js";
import { set } from "mongoose";


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

app.get("/redis-datatype", async (req, res) => {
    // strings
    redis.get("key", 'value', 'EX', TTL)//time to expire
    redis.set('key');

    //HASH

    //hash stores object in key value format like json

    // HSET user:123 name 'madhur' score "5" age "20"
    // HGETALL user:123


    await redis.hset('key', {
        name: 'madhur',
        score: 50,
        age: 20
    })

    await redis.hgetall("key")


    //------------------------ List--------------------------

    // Linked list type data structure 
    // good for queues and stack to implemnet messages and logs /

    // LPUSH MSG "HELLO";
    // RPUSH MSG "HEY"
    // LRANGE MSG 0 -1 GETT ALL LIST 
    // LPOP
    // RPOP

    //------------------------ set ----------------------------

    // set stores unique items ,  no duplicates 

    // user for blacklist token , unique tags , user badge


    //--------------------- sorted set------------------------

    // sorted set
    // used for leadership board , ranking system , scoreaboard , priority queue



    //     ZADD leaderboard 50 "Madhur"
    // ZADD leaderboard 70 "Rohan"
})


app.get('/Eviction-Policies', async (params) => {
    //     Redis uses eviction when the maxmemory is reached.

    // Policy	Meaning
    // noeviction	❌ throws error
    // allkeys-lru	evict least-recently-used
    // allkeys-lfu	evict least-frequently-used
    // allkeys-random	evict random key
    // volatile-lru	LRU from keys with TTL only
    // volatile-lfu	LFU from TTL keys only
    // volatile-ttl	keys expiring soon get evicted

    // Most used:
    // ✅ allkeys-lru
    // ✅ allkeys-lfu
})

async function setAdd() {
  await redis.zadd('leadership', [
    { score: 0, value: "madhur" },
    { score: 0, value: "sarva" },
    { score: 0, value: "khushi" }
  ]);

}

// setAdd();
app.get('/sorted-set', async (req, res) => {
//   await setAdd();

  console.log(await redis.zrange("leadership", 0, -1));

  const result = await redis.zrange("leadership", 0, -1);
  console.log(result);   // → [ "madhur", "0", "sarva", "0", "khushi", "0" ]

//   await redis.zincrby('leadership', 1, "madhur");

  return res.send('sorted set');
});



app.listen(3000, () => {
    console.log("server started at 3000");
})