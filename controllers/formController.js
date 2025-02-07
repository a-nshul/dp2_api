const Form = require("../models/formModel");
const User = require("../models/userModel");

// Create a new form
const createForm = async (req, res) => {
    try {
        const { userId,  fields } = req.body;
        if (!userId  || !fields || !Array.isArray(fields)) {
            return res.status(400).json({ message: "Invalid data provided" });
        }

        const newForm = new Form({ userId,  fields });
        await newForm.save();

        // Populate user mobileno
        const populatedForm = await Form.findById(newForm._id).populate("userId", "mobileno");

        res.status(201).json({ message: "Form created successfully", form: populatedForm });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all forms of a specific user
const getFormsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const forms = await Form.find({ userId }).populate("userId", "mobileno");

        res.status(200).json({ message: "User forms fetched", forms });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single form by ID
const getFormById = async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await Form.findById(formId).populate("userId", "mobileno");

        if (!form) return res.status(404).json({ message: "Form not found" });

        res.status(200).json({ message: "Form fetched successfully", form });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a form dynamically
const updateForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const updatedForm = await Form.findByIdAndUpdate(formId, req.body, { new: true })
            .populate("userId", "mobileno");

        if (!updatedForm) return res.status(404).json({ message: "Form not found" });

        res.status(200).json({ message: "Form updated successfully", form: updatedForm });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a form
const deleteForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const deletedForm = await Form.findByIdAndDelete(formId).populate("userId", "mobileno");

        if (!deletedForm) return res.status(404).json({ message: "Form not found" });

        res.status(200).json({ message: "Form deleted successfully", form: deletedForm });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createForm, getFormsByUser, getFormById, updateForm, deleteForm };
