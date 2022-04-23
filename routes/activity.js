import express from "express";
const router = express.Router();
import activityModal from "../models/activity.js";

router.get("/:id", async (req, res) => {
  let activityLog;
  try {
    activityLog = await activityModal.find({ doctorId: req.params.id });

    if (activityLog.length > 0) {
      return res.status(200).send(activityLog);
    }
    return res.status(404).send("no activity found");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const activity = await activityModal.findByIdAndDelete(req.params.id);
    if (activity) return res.status(204).send("Activity Deleted");
    res.status(404).send("No Activity Log Found");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
