const { Kafka } = require("kafkajs");
const redisClient = require("../module/service/redis");
const BulkAction = require("../module/models/BulkAction");
const BulkActionLog = require("../module/models/BulkActionLog");

class BulkActionConsumer {

  constructor(topic, models) {
    this.kafka = new Kafka({
      clientId: "bulk-action-consumer",
      brokers: ["localhost:9092"],
    });
    this.consumer = this.kafka.consumer({ groupId: "bulk-action-group" });
    this.topic = topic;
    this.models = models;
    this.rateLimit = 1000;
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });

    console.log(`Listening on topic: ${this.topic}`);

    await this.consumer.run({
      eachBatch: async ({ batch }) => {
        console.log(`Processing batch of ${batch.messages.length} messages`);
        await this.processBatch(batch.messages);
      },
    });
  }

  async processBatch(messages) {
  const now = Math.floor(Date.now() / 1000 / 60);
  const processedAccounts = new Set();
  const bulkActionProcessed = new Set();
  let totalRecordsForBatch = 0;
  for (const message of messages) {
    const { accountId, bulkActionId, batch, entityType, actionType, fieldsToUpdate, isFinalBatch, totalRecords } =
      JSON.parse(message.value.toString());
    totalRecordsForBatch += totalRecords;
    if (!accountId || !entityType) {
      console.log(`Skipping message - missing accountId or entityType for bulkActionId: ${bulkActionId}`);
      continue;
    }

    const key = `rate-limit:${accountId}:${now}`;
    let currentCount = await redisClient.get(key);
    currentCount = currentCount ? parseInt(currentCount) : 0;

    if (currentCount >= this.rateLimit) {
      console.log(`Rate limit reached for account ${accountId}. Skipping batch...`);
      continue;
    }

    let processCount = 0;
    for (const record of batch) {
      if (currentCount + processCount >= this.rateLimit) {
        console.log(`Rate limit reached for account ${accountId}. Stopping further processing.`);
        break;
      }

      await this.processMessage({
        value: JSON.stringify({ accountId, bulkActionId, entityType, actionType, fieldsToUpdate, record }),
      });
      processCount++;
    }

    await redisClient.incrBy(key, processCount);
    await redisClient.expire(key, 60);
    processedAccounts.add(accountId);

    if (isFinalBatch) {
      bulkActionProcessed.add(bulkActionId);
    }
  }

  for (const bulkActionId of bulkActionProcessed) {
    const bulkAction = await BulkAction.findByPk(bulkActionId);
    if (bulkAction) {
      const totalProcessed = bulkAction.successCount + bulkAction.failureCount + bulkAction.skippedCount;
      if (totalProcessed >= totalRecordsForBatch) {
        await bulkAction.update({ status: "completed" });
        console.log(`Bulk action ${bulkActionId} marked as completed!`);
      }
    }
  }

  for (const account of processedAccounts) {
    const key = `rate-limit:${account}:${now}`;
    await redisClient.del(key);
  }
}

    

  async processMessage(message) {
    try {
      console.log("Received message:", message.value.toString());
  
      const parsedMessage = JSON.parse(message.value.toString());
  
      if (!parsedMessage.record) {
        console.log("Missing `record` in message:", parsedMessage);
        return;
      }
  
      const { entityType, actionType, record, bulkActionId } = parsedMessage;
      const Model = this.models[entityType];
  
      if (!Model) {
        console.log(`No model found for entity: ${entityType}`);
        return;
      }
  
      const bulkAction = await BulkAction.findByPk(bulkActionId);
      if (!bulkAction) {
        console.log(`Bulk Action ID not found: ${bulkActionId}`);
        return;
      }
  
      let status = "success";
      let errorMessage = null;
  
      try {
        if (actionType === "create") {
          const existingRecord = await Model.findOne({ where: { email: record.email } });
          if (existingRecord) {
            status = "skipped";
            errorMessage = "Duplicate email";
          } else {
            await Model.create(record);
          }
        } else if (actionType === "update") {
          await Model.update(record, { where: { email: record.email } });
        } else if (actionType === "delete") {
          await Model.destroy({ where: { id: record.id } });
        } else {
          console.log(`Unsupported actionType: ${actionType}`);
          return;
        }
      } catch (err) {
        status = "failure";
        errorMessage = err.message;
      }
  
      await BulkActionLog.create({ bulkActionId, recordId: record.id, status, errorMessage });
      await bulkAction.increment({ [`${status}Count`]: 1 });
  
      console.log(`Processed record ${record.id} for actionId ${bulkActionId}: ${status}`);
    } catch (error) {
      console.log("Error processing message:", error);
    }
  }
  
  
  
}

module.exports = BulkActionConsumer;
