

const express = require("express");
const bulkActionRoutes = require("../controller/bulkAction");






const initializeRouter = (app) => {
  const router = express.Router();
  router.use("/bulk-action", bulkActionRoutes);
  app.use(router);
};

module.exports = initializeRouter;
