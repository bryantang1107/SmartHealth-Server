import express from "express";
const router = express.Router();
import schedule from "node-schedule";
import userModel from "../models/user.js";

import "dotenv/config";

router.get("/", (req, res) => {
  //date & time
  // const someDate = new Date("2022-02-26T09:29:00Z");
  // schedule.scheduleJob(someDate, () => {
  //   console.log("Job ran at", new Date().toString());
  // }); //name of job, date to trigger, callback (action for the job)
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

router.get("/cancel-reminder", (req, res) => {
  schedule.cancelJob("job_name"); //cancel job

  //delete from db
});

export default router;
