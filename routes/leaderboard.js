const express = require("express");
const jwt = require("jsonwebtoken");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token found, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Extract userId from the token
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Route to fetch leaderboard data with cumulative marks
router.get("/", authenticate, async (req, res) => {
  try {
    // Aggregate results to calculate total marks per user
    const results = await QuizResult.aggregate([
      {
        $group: {
          _id: "$username", // Group by email
          totalMarks: { $sum: "$highestMarks" }, // Sum the marks for all quizzes
        },
      },
      {
        $lookup: {
          from: "users", // Join with the Users collection
          localField: "_id",
          foreignField: "email",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Unwind to access user details
      },
      {
        $project: {
          email: "$_id",
          totalMarks: 1,
          name: "$userDetails.name", // Include user name if available
        },
      },
      {
        $sort: { totalMarks: -1 }, // Sort by total marks in descending order
      },
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
