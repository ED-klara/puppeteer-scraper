// File: server.js

const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing URL in request body." });
  }

  console.log(`Starting Puppeteer scrape for: ${url}`);

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Example scrape: Get all text content from <body>
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 1000),
      };
    });

    await browser.close();
    res.status(200).json({ url, ...data });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Failed to scrape site." });
  }
});

app.get("/", (req, res) => {
  res.send("Puppeteer scraping server is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
