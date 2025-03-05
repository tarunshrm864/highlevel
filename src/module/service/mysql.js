const { Sequelize } = require("sequelize");
require("dotenv").config();

class MySQL {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
        timezone: "+05:30"
      }
    );
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log("MySQL Connected");
    } catch (error) {
      console.log("MySQL Connection Failed:", error);
    }
  }
}

const mysqlInstance = new MySQL();
mysqlInstance.connect();

module.exports = mysqlInstance.sequelize;
