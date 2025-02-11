const express = require("express");
const { 
    submitResponse, 
    getResponsesByUser, 
    getResponseById, 
    updateResponse, 
    deleteResponse 
} = require("../controllers/responseController");

const router = express.Router();

router.post("/submit", submitResponse); // Submit a new response
router.get("/user/:userId", getResponsesByUser); // Get all responses for a user
router.get("/single/:id", getResponseById); // Get a single response
router.put("/update/:id", updateResponse); // Update a response
router.delete("/delete/:id", deleteResponse); // Delete a response

module.exports = router;
