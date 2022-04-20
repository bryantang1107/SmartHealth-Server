import admin from "../firebase.js";
import jwt from "jsonwebtoken";
export default async function authenticateToken(req, res, next) {
  //get token, comes from header (Bearer)
  //firebase token authentication 

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); //token do not exist, return error

  //token exist
  try {
    const decodeValue = await admin.auth().verifyIdToken(token);
    if (decodeValue) {
      req.user = decodeValue; 
      return next();
    }
    return res.json({ message: "Unauthorized" });
  } catch (err) {
    return res.json({ message: "Internal Server Error " });
  }
}

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("Token do not exist");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).send("Unauthorized");
    req.user = user;
    next();
  });
}
