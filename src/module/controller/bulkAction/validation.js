const Joi = require("joi");

const bulkActionSchema = Joi.object({
  actionType: Joi.string().valid("update", "delete", "create").required(),
  entityType: Joi.string().valid("contacts").required(),
  accountId: Joi.string().required(),
  scheduledAt: Joi.date().optional()
});

const validateBulkAction = (req, res, next) => {
  const { error } = bulkActionSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ errors: error.details.map((d) => d.message) });
  }

  if (!req.file) {
    return res.status(400).json({ error: "File is required for bulk upload" });
  }

  next();
};

module.exports = { validateBulkAction };
