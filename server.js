import express from "express";
import "dotenv/config";
const app = express();
import cors from "cors";
import router from "./routes/covid.js";
import doctorRoute from "./routes/doctor.js";
import reminder from "./routes/reminder.js";
import login from "./routes/login.js";
import { authenticateJWT } from "./middleware/authenticateToken.js";
import chat from "./routes/chat.js";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import pharmacy from "./routes/pharmacy.js";
import morgan from "morgan";
import moment from "moment-timezone";
import { deleteFile } from "./accessLog.js";
import mongoose from "mongoose";
import userRoute from "./routes/user.js";
import appointmentRoute from "./routes/appointment.js";
import activityRoute from "./routes/activity.js";
import Grid from "gridfs-stream";
import scheduler from "./middleware/scheduler.js";

import fs from "fs";
import { dirname } from "path";
import path from "path";
const require = createRequire(import.meta.url);

const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
import {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} from "./middleware/users.js";

app.use(
  cors({
    origin: "*",
  })
);

io.of("/chat").on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) return callback(error);
    //can pass back callback with arguments to client
    const current = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    });
    socket.join(user.room);
    socket.emit("message", {
      user: "admin",
      time: current,
      text: `${user.username}, Welcome To The Consultation Room - Smart Health Admin  `,
      type: "text",
    });

    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      time: current.toLocaleTimeString(),
      text: `${user.username}, has joined !`,
      type: "text",
    });

    io.of("/chat")
      .to(user.room)
      .emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    callback();
  });
  socket.on("call", (name) => {
    const user = getUser(socket.id);
    const current = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      time: current,
      text: `${name} has started video, Please Join !`,
      type: "text",
    });
  });

  socket.on("join video", () => {
    socket.emit("me", socket.id);
  });

  socket.on("endCall", () => {
    socket.emit("leaveCall");
  });

  socket.on("callUser", (data) => {
    const user = getUser(socket.id);

    io.of("/chat").to(user.room).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.of("/chat").to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("send-message", (message, callback) => {
    const current = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    });
    const user = getUser(socket.id);
    io.of("/chat").to(user.room).emit("message", {
      user: user.username,
      time: current,
      text: message.body,
      type: message.type,
      fileName: message.fileName,
      mimeType: message.mimeType,
    });
    io.of("/chat")
      .to(user.room)
      .emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    callback();
  });

  socket.on("disconnect", () => {
    const current = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
    });
    const user = removeUser(socket.id);
    if (user) {
      io.of("/chat")
        .to(user.room)
        .emit("message", {
          user: "admin",
          time: current,
          text: `${user.username} has left the chat.`,
          type: "text",
        });
    }
  });
});

app.set("views", "./views");
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//custom token with local date, access via :date with region as parameter
//access log using middleware logger
morgan.token("date", (req, res, region) => {
  return moment().tz(region).format();
});
morgan.format(
  "myformat",
  `[:date[Asia/Kuala_Lumpur]] :method :status :url "HTTP/:http-version"`
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("myformat", { stream: accessLogStream }));
app.use("/login", login);
app.use("/user", userRoute);
app.use("/authroom", chat);
app.use("/reminder", reminder);
app.use("/appointment", appointmentRoute);
app.use("/activity-log", activityRoute);
app.use(authenticateJWT);
app.get("/check", (req, res) => {
  res.send(true);
});

app.use("/covid", router);
app.use("/find-doctor", doctorRoute);

app.use("/pharmacy", pharmacy);
let gfs;
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port : ${process.env.PORT}`);
  // makeReminder();
  deleteFile();
  scheduler.start();
  //connect to database
  mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error(err);
  });

  db.on("open", () => {
    console.log("Smart Health Database Connected");
    gfs = Grid(db, mongoose.mongo);
    gfs.collection("uploads");
  });
});
