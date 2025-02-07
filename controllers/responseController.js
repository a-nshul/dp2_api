const Response = require("../models/responseModel");

// Submit a response to a form
const submitResponse = async (req, res) => {
    try {
        const { formId, userId, answers } = req.body;

        if (!formId || !userId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Invalid response data" });
        }

        const newResponse = new Response({ formId, userId, answers });
        await newResponse.save();

        res.status(201).json({ message: "Response submitted successfully", response: newResponse });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all responses for a form
const getResponsesByForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const responses = await Response.find({ formId }).populate("userId", "mobileno");

        res.status(200).json({ message: "Responses fetched", responses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single response by ID
const getResponseById = async (req, res) => {
    try {
        const { responseId } = req.params;
        const response = await Response.findById(responseId).populate("userId", "mobileno");

        if (!response) return res.status(404).json({ message: "Response not found" });

        res.status(200).json({ message: "Response fetched successfully", response });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a response
const updateResponse = async (req, res) => {
    try {
        const { responseId } = req.params;
        const updatedResponse = await Response.findByIdAndUpdate(responseId, req.body, { new: true }).populate("userId", "mobileno");

        if (!updatedResponse) return res.status(404).json({ message: "Response not found" });

        res.status(200).json({ message: "Response updated successfully", response: updatedResponse });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a response
const deleteResponse = async (req, res) => {
    try {
        const { responseId } = req.params;
        const deletedResponse = await Response.findByIdAndDelete(responseId);

        if (!deletedResponse) return res.status(404).json({ message: "Response not found" });

        res.status(200).json({ message: "Response deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { 
    submitResponse, 
    getResponsesByForm, 
    getResponseById, 
    updateResponse, 
    deleteResponse 
};
