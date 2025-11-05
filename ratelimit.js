import redis from "./redisConfig.js";

export const rateLimiter = (limit, windowSec) => {
    return async (req, res, next) => {
        try {
            const user = "madhur";  // Ideally get from auth
            const key = `rate:${user}`;

            // Increment request count
            const count = await redis.incr(key);

            // If first request → set expiry
            if (count === 1) {
                await redis.expire(key, windowSec);
            }

            if (count > limit) {
                return res.status(429).json({
                    message: "Too many requests, try again later.",
                });
            }

            next();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Rate limiter failed" });
        }
    };
};
