const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());

const shortcodes = new Set();

function generateShortcode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code;
  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (shortcodes.has(code)); 
  shortcodes.add(code);
  return code;
}

app.post("/shorturls", (req, res) => {
  const { url, validity, shortcode } = req.body;

  let finalCode = shortcode;
  if (!finalCode) {
    finalCode = generateShortcode();
  } else if (shortcodes.has(finalCode)) {
    return res.status(409).json({ error: "Shortcode already exists!" });
  } else {
    shortcodes.add(finalCode);
  }

  res.status(201).json({
    shortLink: `http://localhost:3000/${finalCode}`,
    expiry: new Date(Date.now() + 30 * 60000).toISOString() 
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
