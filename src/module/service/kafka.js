const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "bulk-upload-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const initKafka = async () => {
  await producer.connect();
  console.log("Kafka Producer Connected");
};

const publishToKafka = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error("Error publishing to Kafka:", error);
  }
};

module.exports = { initKafka, publishToKafka, producer };
