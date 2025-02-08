const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
    answers: [
        {
            question: { type: String, required: true },  // Question (from form)
            answer: { type: mongoose.Schema.Types.Mixed, required: true } // Store any type (string, number, file URL)
        }
    ]
}, { timestamps: true });

const Response = mongoose.model("Response", responseSchema);

module.exports = Response;
