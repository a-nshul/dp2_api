const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: { type: String, required: true }, // Ensure 'type' is defined correctly
    required: { type: Boolean, default: false }
});

const formSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // title: { type: String, required: true },
    fields: { type: [fieldSchema], required: true } // Explicitly define the structure
}, { timestamps: true });

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
