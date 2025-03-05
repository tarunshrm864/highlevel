const cron = require("node-cron");
const { Op } = require("sequelize");
const BulkAction = require("../module/models/BulkAction");
const processCSV = require("../module/service/fileProcessor");
const path = require("path");
const moment = require("moment");

const scheduleBulkActions = () => {
  cron.schedule("* * * * *", async () => {

    try {
      const now = moment().toDate();
      const pendingActions = await BulkAction.findAll({
        where: { status: "pending", scheduledAt: { [Op.lte]: now } },
      });

      if (pendingActions.length === 0) {
        return;
      }

      for (const action of pendingActions) {
        console.log(`Executing scheduled bulk action ID: ${action.id}`);

        await action.update({ status: "processing" });

        const uploadDir = path.join(__dirname, "../../../uploads");
        const csvPath = path.join(uploadDir, `${action.id}.csv`);

        await processCSV(csvPath, {
          entityType: action.entityType,
          actionType: action.actionType,
          bulkActionId: action.id,
          accountId: action.accountId,
        });

        console.log(`Bulk action ${action.id} started processing.`);
      }
    } catch (error) {
      console.error("Error in scheduler:", error);
    }
  });
};

module.exports = { scheduleBulkActions };
