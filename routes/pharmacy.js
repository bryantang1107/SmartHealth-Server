import express from "express";
const router = express.Router();
import axios from "axios";
import { medicine } from "../data/Medicine.js";

router.get("/", (req, res) => {
  res.status(200).json(medicine);
});
router.get("/:category", (req, res) => {
  const { category } = req.params;
  const result = medicine.filter((data) => data.category === category);
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(401).send("No products found");
  }
});

router.get("/:category/az", (req, res) => {
  const { category } = req.params;
  const result = medicine.filter((data) => data.category === category);
  result.sort((a, b) => {
    let textA = a.name.toUpperCase();
    let textB = b.name.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(401).send("No products found");
  }
});
router.get("/:category/azdesc", (req, res) => {
  const { category } = req.params;
  const result = medicine.filter((data) => data.category === category);
  result.sort((a, b) => {
    let textA = a.name.toUpperCase();
    let textB = b.name.toUpperCase();
    return textA > textB ? -1 : textA < textB ? 1 : 0;
  });

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(401).send("No products found");
  }
});
router.get("/:category/price", (req, res) => {
  const { category } = req.params;
  const result = medicine.filter((data) => data.category === category);
  result.sort((a, b) => {
    return parseFloat(a.price) - parseFloat(b.price);
  });

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(401).send("No products found");
  }
});
router.get("/:category/pricedesc", (req, res) => {
  const { category } = req.params;
  const result = medicine.filter((data) => data.category === category);
  result.sort((a, b) => {
    return parseFloat(b.price) - parseFloat(a.price);
  });

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(401).send("No products found");
  }
});

export default router;
