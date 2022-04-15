import schedule from "node-schedule";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
export const deleteFile = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const filepath = path.join(__dirname, "access.log");
  schedule.scheduleJob("job_name", "0 0 * * *", () => {
    try {
      fs.unlinkSync(filepath);
    } catch (e) {
      console.log("file cleared");
    }
  });
  console.log("clear file");
};
