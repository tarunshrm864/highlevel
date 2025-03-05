const { DataTypes, Model } = require("sequelize");
const sequelize = require("../service/mysql");

class BulkActionLog extends Model { }

BulkActionLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bulkActionId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        recordId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("success", "failure", "skipped"),
            allowNull: false
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        accountId: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: "BulkActionLog",
        timestamps: true,
        updatedAt: false
    }
);

module.exports = BulkActionLog;
