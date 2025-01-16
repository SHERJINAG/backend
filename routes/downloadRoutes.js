// routes/downloadRoutes.js

const express = require("express");
const path = require("path");
const router = express.Router();

// Handle the download route for specific PDFs
router.get("/download/:pdfName", (req, res) => {
  const pdfName = req.params.pdfName;
  const filePath = path.join(__dirname, "../public", pdfName);

  res.download(filePath, pdfName, (err) => {
    if (err) {
      res.status(500).send("Error in downloading the file.");
    }
  });
});

module.exports = router;
