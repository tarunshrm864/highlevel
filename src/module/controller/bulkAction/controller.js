
const fs = require("fs");
const path = require("path");
const BulkAction = require("../../models/BulkAction");
const processCSV = require("../../service/fileProcessor");
const BulkActionLog = require("../../models/BulkActionLog");
const sequelize = require("../../service/mysql");
const moment = require('moment-timezone');

exports.createBulkAction = async (req, res) => {
  try {
    const { entityType, actionType, accountId, scheduledAt } = req.body;

    const bulkAction = await BulkAction.create({
      entityType,
      actionType,
      accountId,
      status: scheduledAt ? "pending" : "processing",
      scheduledAt: scheduledAt ? moment(scheduledAt).tz('Asia/Kolkata').toDate() : null,
    });

    const uploadDir = path.join(__dirname, "../../../../uploads");
    const newFilePath = path.join(uploadDir, `${bulkAction.id}.csv`);
    fs.renameSync(req.file.path, newFilePath);

    if (!scheduledAt) {
      await processCSV(newFilePath, {
        entityType,
        actionType,
        bulkActionId: bulkAction.id,
        accountId,
      });
    }

    res.json({ message: "Bulk action started", actionId: bulkAction.id });
  } catch (error) {
    res.status(500).json({ error: "Error processing CSV file", details: error.message });
  }
};




exports.getBulkActionStatus = async (req, res) => {
  try {
    const bulkAction = await BulkAction.findByPk(req.params.actionId);
    if (!bulkAction) return res.status(404).json({ error: "Bulk action not found" });

    res.json(bulkAction);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bulk action status", details: error.message });
  }
};

exports.getBulkActionStats = async (req, res) => {
  try {
    const { actionId } = req.params;
    const bulkAction = await BulkAction.findByPk(actionId);
    if (!bulkAction) return res.status(404).json({ error: "Bulk action not found" });

    const stats = await BulkActionLog.findAll({
      where: { bulkActionId: actionId }
    });

    return res.json({stats});
  } catch (error) {
    res.status(500).json({ error: "Error fetching bulk action stats", details: error.message });
  }
};

exports.getBulkActions = async (req, res) => {
  try {
    const bulkActions = await BulkAction.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({ data: bulkActions });
  } catch (error) {
    res.status(500).json({ error: "Error fetching bulk actions", details: error.message });
  }
};

