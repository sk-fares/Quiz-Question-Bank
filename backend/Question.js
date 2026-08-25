const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },

    options: {
        type: [String],
        required: true
    },

    correctAnswer: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Question", questionSchema);