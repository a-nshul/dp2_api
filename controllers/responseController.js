const Response = require("../models/responseModel");

// Submit a response
const submitResponse = async (req, res) => {
    try {
        const { userId, answers } = req.body;

        if (!userId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Invalid response data" });
        }

        // Check if the user already submitted a response
        const existingResponse = await Response.findOne({ userId });

        if (existingResponse) {
            return res.status(400).json({ message: "User has already submitted a response. You can only update it." });
        }

        // Create a new response
        const newResponse = new Response({ userId, answers });
        await newResponse.save();

        // Populate user details fully
        const populatedResponse = await Response.findById(newResponse._id).populate({
            path: "userId",
            select: "mobileno fields apiKey secretKey active"
        });

        res.status(201).json({ 
            message: "Response submitted successfully", 
            response: populatedResponse 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all responses for a user
const getResponsesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const responses = await Response.find({ userId }).populate({
            path: "userId",
            select: "mobileno fields apiKey secretKey active" // Specify the fields to include
        });

        res.status(200).json({ message: "Responses fetched", responses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single response by ID
const getResponseById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Response.findById(id).populate({
            path: "userId",
            select: "mobileno fields apiKey secretKey active" // Specify the fields to include
        });

        if (!response) return res.status(404).json({ message: "Response not found" });

        res.status(200).json({ message: "Response fetched successfully", response });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a response
const updateResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedResponse = await Response.findByIdAndUpdate(id, req.body, { new: true }).populate({
            path: "userId",
            select: "mobileno fields apiKey secretKey active" // Specify the fields to include
        });

        if (!updatedResponse) return res.status(404).json({ message: "Response not found" });

        res.status(200).json({ message: "Response updated successfully", response: updatedResponse });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a response
const deleteResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResponse = await Response.findByIdAndDelete(id);

        if (!deletedResponse) return res.status(404).json({ message: "Response not found" });

        res.status(200).json({ message: "Response deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { 
    submitResponse, 
    getResponsesByUser, 
    getResponseById, 
    updateResponse, 
    deleteResponse 
};
