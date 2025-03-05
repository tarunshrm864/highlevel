
const fs = require("fs");
const csvParser = require("csv-parser");
const { publishToKafka } = require("./kafka");

const BATCH_SIZE = 500;

async function processCSV(filePath, { actionType, entityType, bulkActionId, accountId }) {
  return new Promise((resolve, reject) => {
    let totalRecords = 0;
    const batch = [];
    const stream = fs.createReadStream(filePath).pipe(csvParser());

    stream.on("data", async (row) => {
      batch.push(row);
      totalRecords++;

      if (batch.length >= BATCH_SIZE) {
        await publishToKafka("bulk-action", {
          entityType,
          actionType,
          batch,
          bulkActionId,
          accountId,
          totalRecords,
          isFinalBatch: false,
        });
        batch.length = 0;
      }
    });

    stream.on("end", async () => {
      if (batch.length > 0) {
        await publishToKafka("bulk-action", {
          entityType,
          actionType,
          batch,
          bulkActionId,
          accountId,
          totalRecords,
          isFinalBatch: true,
        });
      }

      console.log("CSV Processing Complete");
      fs.unlinkSync(filePath);
      resolve();
    });

    stream.on("error", (error) => reject(error));
  });
}




module.exports = processCSV;
