const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    mobileno:{
      type:String,
      unique: true,
      required: false,
      trim: true,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
