const mongoose = require("mongoose");

// Schema for answers
const answerSchema = new mongoose.Schema({
  answer: { type: String, required: true },
  email: { type: String, required: true }, // Store the user's email instead of userId
});

// Schema for questions
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    email: { type: String, required: true }, // Store the user's email
    answers: [answerSchema], // Embedded subdocument for answers
  },
  { timestamps: true } // Automatically manage `createdAt` and `updatedAt`
);

// Export the Question model
module.exports = mongoose.model("Question", questionSchema);
