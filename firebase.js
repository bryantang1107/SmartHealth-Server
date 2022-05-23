//for backend

import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
});

export default admin; //admin used to authenticate user instead of using jwt
