const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    mobileno: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    fields: { type: [fieldSchema], default: [] } ,// Add fields similar to Form schema
    apiKey: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents without apiKey
    },
    secretKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
