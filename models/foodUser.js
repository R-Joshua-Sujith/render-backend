const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
})

const foodUserModel = mongoose.model("foodusers", userSchema);

module.exports = foodUserModel;
