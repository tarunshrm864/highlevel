const express = require("express");
const { createBulkAction, getBulkActionStatus, getBulkActionStats, getBulkActions } = require("./controller");
const { validateBulkAction } = require("./validation");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });



router.post("/upload", upload.single("file"), validateBulkAction, createBulkAction);
router.get("/", getBulkActions);
router.get("/:actionId", getBulkActionStatus);
router.get("/:actionId/stats", getBulkActionStats);

module.exports = router;
