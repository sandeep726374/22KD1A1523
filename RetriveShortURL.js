const express = require("express");
const app = express();
app.use(express.json());


const shortcodes = new Map(); 

function generateShortcode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code;
  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (shortcodes.has(code));
  return code;
}

app.post("/shorturls", (req, res) => {
  const { url, shortcode } = req.body;

  let finalCode = shortcode || generateShortcode();
  if (shortcodes.has(finalCode)) {
    return res.status(409).json({ error: "Shortcode already exists!" });
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 60000); 

  shortcodes.set(finalCode, {
    originalUrl: url,
    createdAt: now,
    expiry: expiry,
    clicks: 0,
    clickData: [] 
  });

  res.status(201).json({
    shortLink: `http://localhost:3000/${finalCode}`,
    expiry: expiry.toISOString()
  });
});


app.get("/:shortcode", (req, res) => {
  const { shortcode } = req.params;
  const data = shortcodes.get(shortcode);

  if (!data) {
    return res.status(404).json({ error: "Shortcode not found!" });
  }

  if (new Date() > data.expiry) {
    return res.status(410).json({ error: "Shortcode expired!" });
  }


  data.clicks++;
  data.clickData.push({
    timestamp: new Date(),
    referrer: req.get("Referrer") || "direct",
    location: req.ip 
  });

  res.redirect(data.originalUrl);
});


app.get("/shorturls/:shortcode", (req, res) => {
  const { shortcode } = req.params;
  const data = shortcodes.get(shortcode);

  if (!data) {
    return res.status(404).json({ error: "Shortcode not found!" });
  }

  res.json({
    shortcode,
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    expiry: data.expiry,
    totalClicks: data.clicks,
    clickDetails: data.clickData
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
