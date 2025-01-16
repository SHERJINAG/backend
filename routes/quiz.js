const express = require('express');
const jwt = require('jsonwebtoken');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token found, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Extract userId from the token
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// POST: Submit quiz results
router.post('/save-result', authenticate, async (req, res) => {
  const { quizTitle, marks } = req.body;

  // Validate incoming data
  if (!quizTitle || typeof marks !== 'number') {
    return res.status(400).json({ message: 'Invalid input: quizTitle and marks are required' });
  }

  try {
    // Fetch user email based on userId
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.email; // Get email from the User document

    // Check if the result already exists for this quiz and username
    const existingResult = await QuizResult.findOne({ username, quizTitle });

    if (existingResult) {
      // Increment attempts and update highest marks if needed
      existingResult.attempts += 1;
      existingResult.highestMarks = Math.max(existingResult.highestMarks, marks);
      await existingResult.save();
    } else {
      // Save new result
      const newResult = new QuizResult({
        username,
        quizTitle,
        highestMarks: marks,
        attempts: 1,
      });
      await newResult.save();
    }

    res.status(200).json({ message: 'Quiz results saved successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Retrieve quiz results for a user
router.get('/get-results', authenticate, async (req, res) => {
  try {
    // Fetch user email based on userId
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.email; // Get email from the User document

    // Fetch quiz results for the user
    const results = await QuizResult.find({ username });
    res.status(200).json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
