import express from "express";
const router = express.Router();
import schedule from "node-schedule";
import userModel from "../models/user.js";
import reminderModel from "../models/reminder.js";

import "dotenv/config";

router.post("/email-reminder", async (req, res) => {
  try {
    const reminder = await new reminderModel({
      _id: req.body.userData,
      email: req.body.email,
    });
    await reminder.save();
    res.status(200).send("Email Received");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
router.get("/email-reminder/:id", async (req, res) => {
  let user;
  try {
    user = await reminderModel.findById(req.params.id);
    if (user === null) {
      return res.status(200).send(false);
    }
    return res.status(200).send(true);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/get-reminder/:id", async (req, res) => {
  let user;
  try {
    user = await userModel.findById(req.params.id);
    if (user) {
      return res.status(200).json(user.reminder);
    }
  } catch (error) {
    console.log(error);
  }
});
router.delete("/cancel-email-reminder", async (req, res) => {
  //delete from db
  try {
    await reminderModel.findByIdAndDelete(req.body.userData);
    res.status(202).send("Deleted Succesfully");
  } catch (error) {
    res.status(500).send("Internal Server Errror");
  }
});

router.post("/update", async (req, res) => {
  let user;
  try {
    user = await userModel.findById(req.body.userData);
    let reminder = user.reminder;
    reminder = [...reminder, req.body.obj];
    user.reminder = reminder;
    await user.save();
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:index", async (req, res) => {
  let user;
  try {
    user = await userModel.findById(req.body.userData);
    if (user === null) {
      return res.status(404).send("no user found in database");
    }
    if (req.params.index > -1) {
      user.reminder.splice(req.params.index, 1);
    }
    await user.save();
    return res.status(202).send("successfully deleted");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
