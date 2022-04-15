import express from "express";
const router = express.Router();
const url = "https://api.covid19api.com/summary";
import fetch from "node-fetch";

router.get("/", async (req, res) => {
  const response = await fetch(url);
  const data = await response.json();
  const globalData = data.Global;

  data.Countries.map((country) => {
    if (country.Country === "Malaysia") {
      res.status(200).json({ globalData, country });
    }
    return;
  });
});

export default router;
