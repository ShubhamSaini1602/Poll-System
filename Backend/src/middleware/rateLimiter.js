const redisClient = require("../config/redis");

const rateLimiter = async(req, res, next) => {
    try{
        const ip = req.ip;

        const key = `IP:${ip}`;
        const no_of_requests = await redisClient.incr(key);

        if(no_of_requests > 250){
            // 429 = Too Many Requests
            return res.status(429).send("Too many requests from this IP, please try again later");
        }

        if(no_of_requests===1){
            await redisClient.expire(key, 3600);
        }

        next();
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
};

module.exports = rateLimiter;