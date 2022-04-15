import express from "express";
const router = express.Router();
import schedule from "node-schedule";

import "dotenv/config";

router.get("/", (req, res) => {
  //date & time
  // const someDate = new Date("2022-02-26T09:29:00Z");
  // schedule.scheduleJob(someDate, () => {
  //   console.log("Job ran at", new Date().toString());
  // }); //name of job, date to trigger, callback (action for the job)
});

router.get("/cancel-reminder", (req, res) => {
  schedule.cancelJob("job_name"); //cancel job

  //delete from db
});

export default router;
