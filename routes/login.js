import express from "express";
const router = express.Router();
import "dotenv/config";
import jwt from "jsonwebtoken";
import authenticateToken from "../middleware/authenticateToken.js";
import User from "../models/user.js";
import checkRole from "../controller/checkRole.js";

router.get("/", authenticateToken, async (req, res) => {
  const id = req.user.uid;
  //check db if user exist, if not exist create
  const result = await getUser(id);
  const accessToken = generateToken(id);
  res.json({ accessToken, result }); //return access token and user info
});

router.get("/userRole/:id", async (req, res) => {
  const role = await checkRole(req.params.id);
  res.send(role);
});

const generateToken = (user) => {
  //jwt
  return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};
async function getUser(id) {
  let user;
  try {
    user = await User.findById(id);

    if (user === null) {
      const newUser = await new User({
        _id: id,
      });
      await newUser.save();
      return newUser;
    }
    return user;
  } catch (err) {
    console.log(err);
  }
}

export default router;
