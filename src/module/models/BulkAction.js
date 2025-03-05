const { DataTypes, Model } = require("sequelize");
const sequelize = require("../service/mysql");
const { v4: uuidv4 } = require("uuid");

class BulkAction extends Model {}

BulkAction.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scheduledAt: { 
        type: DataTypes.DATE,
        allowNull: true 
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },
    accountId: {
        type: DataTypes.STRING(36),
        defaultValue: null
    },
    successCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failureCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    skippedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    
  },
  {
    sequelize,
    modelName: "BulkAction",
    timestamps: true,
  }
);

module.exports = BulkAction;
