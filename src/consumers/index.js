
const BulkActionConsumer = require("./bulkActionConsumer");
const Contact = require("../module/models/Contact");

const models = { contacts: Contact };

const bulkActionConsumer = new BulkActionConsumer("bulk-action", models);
bulkActionConsumer.start();
