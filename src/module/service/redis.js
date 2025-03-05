

const { createClient } = require("redis");
require("dotenv").config();

class Redis {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    this.client.on("error", (err) => console.error("Redis Error:", err));
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Redis Connected");
    } catch (error) {
      console.error("Redis Connection Failed:", error);
    }
  }
}

const redisInstance = new Redis();
redisInstance.connect();

module.exports = redisInstance.client;