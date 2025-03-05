

const app = require("../src/app");
const BulkActionConsumer = require("../src/consumers/index");
const { initKafka } = require("../src/module/service/kafka");
const { scheduleBulkActions } = require("../src/scheduler/cronJob");
require("dotenv").config();
require("../src/consumers");
const PORT = process.env.PORT || 3000;

const startApp = async () => {
  await initKafka(); 

  scheduleBulkActions();

  app.listen(PORT, () => console.log(`Highlevel App Started on port ${PORT}`));
};

startApp();