import reminder from "../models/reminder.js";
const notificationsWorker = () => {
  return {
    run: function () {
      reminder.sendNotifications();
    },
  };
};

export default notificationsWorker();
