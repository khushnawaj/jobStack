const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    jdUrl: { type: String },
    jdText: { type: String },
    status: { type: String, default: 'Saved' },
    appliedDate: { type: Date },
    salary: { type: String },
    recruiterName: { type: String },
    notes: { type: String },
    resumeVersion: { type: String },
    checklistDone: { type: [String], default: [] },
    aiScore: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
