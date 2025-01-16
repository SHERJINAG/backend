const express = require("express");
const jwt = require("jsonwebtoken");
const Question = require("../models/Question");
const User = require("../models/User"); // Import User model
require("dotenv").config();

const router = express.Router();

// Middleware for authenticating requests
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token found, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user by ID from the User model to get the email
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.email = user.email; // Attach email to the request object
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Route to get all questions
router.get("/", authenticate, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 }); // Fetch questions sorted by latest
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to create a new question
router.post("/", authenticate, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "Question text is required" });
  }

  try {
    const newQuestion = new Question({
      question,
      email: req.email, // Use email extracted from the middleware
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error("Error creating question:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to add an answer to a question
router.post("/:id/answers", authenticate, async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ message: "Answer text is required" });
  }

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Push the new answer to the question's answers array
    question.answers.push({ answer, email: req.email });
    const updatedQuestion = await question.save();

    res.status(201).json(updatedQuestion);
  } catch (error) {
    console.error("Error adding answer:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
