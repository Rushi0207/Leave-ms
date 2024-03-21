const mongoose = require('mongoose');

const leavetypeSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  totalLeaves: { type: Number, required: true },
  takenLeaves: { type: Number, required: true },
  remainingLeaves: { type: Number, required: true }
});

module.exports = mongoose.model('LeaveType', leavetypeSchema);


