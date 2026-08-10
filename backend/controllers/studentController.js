import User from "../models/User.js";

export async function searchStudentsByRoll(req, res) {
  try {
    const roll = String(req.query.roll || "").trim();

    if (!roll) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required",
      });
    }

    const rollRegex = new RegExp(roll, "i");

    const students = await User.find({
      role: "user",
      isProfileComplete: true,
      rollNumber: { $regex: rollRegex },
    })
      .select(
        "name email department stream semester academicYear rollNumber"
      )
      .limit(12);

    const mappedStudents = students.map((student) => ({
      name: student.name,
      email: student.email,
      department: student.department || "",
      stream: student.stream || "",
      academicYear: student.academicYear || "",
      semester: student.semester || "",
      rollNumber: student.rollNumber || "",
    }));

    return res.status(200).json({
      success: true,
      students: mappedStudents,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}