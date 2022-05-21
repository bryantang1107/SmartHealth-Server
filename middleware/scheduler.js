import cron from "cron";
import moment from "moment";
const CronJob = cron.CronJob;
import notificationsWorker from "./notificationsWorker.js";
const schedulerFactory = function () {
  return {
    start: function () {
      new CronJob(
        "00 * * * * *",
        function () {
          console.log(
            "Running send notifications worker for" + moment().format()
          );
          notificationsWorker.run();
        },
        null,
        true,
        ""
      );
    },
  };
};

export default schedulerFactory();
