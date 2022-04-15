import doctor from "../models/doctor.js";
export default async function checkRole(id) {
  let userRole;
  try {
    userRole = await doctor.findById(id);
    if (userRole === null) {
      return "user";
    }
    return "doctor";
  } catch (error) {
    console.log(error);
  }
}
