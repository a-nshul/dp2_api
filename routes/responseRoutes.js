const express = require("express");
const { 
    submitResponse, 
    getResponsesByForm, 
    getResponseById, 
    updateResponse, 
    deleteResponse 
} = require("../controllers/responseController");

const router = express.Router();

router.post("/submit", submitResponse); // Submit a new response
router.get("/:formId", getResponsesByForm); // Get all responses for a form
router.get("/single/:responseId", getResponseById); // Get a single response
router.put("/update/:responseId", updateResponse); // Update a response
router.delete("/delete/:responseId", deleteResponse); // Delete a response

module.exports = router;
