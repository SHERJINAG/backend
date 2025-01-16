const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const quizRoutes = require('./routes/quiz');
const chatRoutes = require('./routes/chat');
const trackProgressRoutes = require("./routes/trackProgress");
const questionRoutes = require("./routes/questions");
const leaderboardRoutes = require("./routes/leaderboard");
const downloadRoutes = require("./routes/downloadRoutes");
const app = express();
const path = require("path");

// Load environment variables
dotenv.config();

// Middleware to parse JSON
app.use(express.json());

app.use("/static", express.static(path.join(__dirname, "public")));
// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Define allowed origins
      const allowedOrigins = ['https://frontend2.onrender.com', 'http://localhost:3000'];

      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true); // Allow the request
      }

      // If the origin is not allowed, return an error
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Enable credentials (e.g., cookies, authorization headers)
  })
);



// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit the app if MongoDB connection fails
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/trackProgress", trackProgressRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/downloads", downloadRoutes);

// Default route for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`);
});
