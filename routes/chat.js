const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const router = express.Router();

// Middleware to parse JSON
router.use(bodyParser.json());

// Chat endpoint
router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    // Construct Wikipedia API URL
    const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
      message
    )}&utf8=1`;

    // Make a request to Wikipedia API
    const response = await axios.get(wikipediaApiUrl);

    // Parse the API response
    const searchResults = response.data.query.search;

    if (searchResults && searchResults.length > 0) {
      const topResult = searchResults[0];
      let snippet = topResult.snippet
        .replace(/(<([^>]+)>)/gi, "") // Remove HTML tags
        .replace(/([.?!])\s/g, "$1|") // Mark sentence boundaries
        .split("|") // Split by sentence boundaries
        .slice(0, 5) // Get up to 5 full sentences
        .join(" ") // Join the sentences
        .trim();

      // Ensure the title isn't repeated in the snippet
      const pageTitle = topResult.title;
      if (snippet.startsWith(pageTitle)) {
        snippet = snippet.substring(pageTitle.length).trim();
      }

      // Ensure the snippet ends with a complete sentence
      if (!snippet.endsWith(".") && !snippet.endsWith("!") && !snippet.endsWith("?")) {
        snippet += ".";
      }

      // Respond with the title and snippet
      res.json({
        response: `${pageTitle}: ${snippet}`,
      });
    } else {
      res.json({ response: "Sorry, I couldn't find any relevant information on Wikipedia." });
    }
  } catch (error) {
    console.error("Error during Wikipedia request:", error.message);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

module.exports = router;
