const mongoose = require('mongoose');
const QuizResultSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Save email here
  quizTitle: { type: String, required: true },
  highestMarks: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  attempts: { type: Number, default: 1 }
});


module.exports = mongoose.model('QuizResult', QuizResultSchema);
