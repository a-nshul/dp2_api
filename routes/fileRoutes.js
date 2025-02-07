const express = require("express");
const { 
    createForm,
    getFormsByUser, 
    getFormById, 
    updateForm, 
    deleteForm 
} = require("../controllers/formController");

const router = express.Router();
router.post("/createForm",createForm);
router.get("/:userId", getFormsByUser); // Get all forms of a user
router.get("/single/:formId", getFormById); // Get a single form by ID
router.put("/update/:formId", updateForm); // Update a form dynamically
router.delete("/delete/:formId", deleteForm); // Delete a form

module.exports = router;
