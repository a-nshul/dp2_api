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
    fields: { type: [fieldSchema], default: [] } // Add fields similar to Form schema
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
