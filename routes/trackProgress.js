const express = require("express");
const jwt = require("jsonwebtoken");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");
require('dotenv').config();

const router = express.Router();

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







// Route to get quiz progress for a user
router.get("/track-progress", authenticate, async (req, res) => {
  try {
    // Fetch user by ID and get their email
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = user.email;

    // Fetch quiz results for the user
    const quizResults = await QuizResult.find({ username });

    // Structure the data for the frontend
    const formattedData = quizResults.map((result) => ({
      quizTitle: result.quizTitle,
      highestMarks: result.highestMarks,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching progress:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
