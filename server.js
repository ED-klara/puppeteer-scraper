const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");
const path = require("path");

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  const incomingKey = req.headers["x-api-key"];
  const expectedKey = process.env.PUPPETEER_SERVICE_API_KEY;

  console.log("📡 Incoming POST /scrape request");
  console.log("🔑 API Key Received:", incomingKey ? "[REDACTED]" : "❌ None Provided");
  console.log("🌐 Target URL:", url || "❌ No URL Provided");

  if (incomingKey !== expectedKey) {
    console.warn("🚫 Unauthorized access attempt");
    return res.status(403).json({ error: "Unauthorized – Invalid API Key" });
  }

  if (!url) {
    console.warn("⚠️ Missing URL in request body");
    return res.status(400).json({ error: "Missing URL in request body." });
  }

  try {
    console.log("🚀 Launching Puppeteer...");

    const chromePath = path.join(
      __dirname,
      ".cache/puppeteer/chrome/linux-135.0.7049.84/chrome-linux64/chrome"
    );

    console.log("🔍 Using Chrome path:", chromePath);

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log("🕵️‍♀️ Scraping content...");
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 1000),
      };
    });

    await browser.close();

    console.log("✅ Scraping successful! Sending response...");
    res.status(200).json({ url, ...data });
  } catch (error) {
    console.error("❌ Scraping error:", error.message || error);
    res.status(500).json({ error: "Failed to scrape site." });
  }
});

app.get("/", (req, res) => {
  res.send("📦 Puppeteer scraping server is running.");
});

app.listen(PORT, () => {
  console.log(`🟢 Server running on port ${PORT}`);
});
