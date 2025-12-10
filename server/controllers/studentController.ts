import { Response } from "express";
import { User } from "../models/User";
import { Student } from "../models/Student";
import { Room } from "../models/Room";
import { Warden } from "../models/Warden";
import { getNextStudentId } from "../models/Counter";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, search, block, status, feeStatus } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);

    const query: any = {};

    if (req.user?.role === "warden" && req.userBlock) {
      query.block = req.userBlock;
    } else if (block) {
      query.block = block;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { studentId: searchRegex },
        { name: searchRegex },
        { roomNumber: searchRegex },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedStudents = students.map((s) => ({
      id: s._id.toString(),
      studentId: s.studentId,
      userId: s.userId.toString(),
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      parentMobile: s.parentMobile,
      address: s.address,
      block: s.block,
      roomId: s.roomId?.toString(),
      roomNumber: s.roomNumber,
      bedNumber: s.bedNumber,
      admissionDate: s.admissionDate.toISOString().split("T")[0],
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));

    paginatedResponse(res, formattedStudents, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all students error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }],
    });

    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    if (req.user?.role === "warden" && req.userBlock && student.block !== req.userBlock) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const warden = await Warden.findOne({ block: student.block });

    const formattedStudent = {
      id: student._id.toString(),
      studentId: student.studentId,
      userId: student.userId.toString(),
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      parentMobile: student.parentMobile,
      address: student.address,
      block: student.block,
      roomId: student.roomId?.toString(),
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
      admissionDate: student.admissionDate.toISOString().split("T")[0],
      status: student.status,
      createdAt: student.createdAt.toISOString(),
      wardenName: warden?.name || "Not Assigned",
      wardenMobile: warden?.mobile || "N/A",
    };

    successResponse(res, formattedStudent);
  } catch (error) {
    console.error("Get student by ID error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getStudentsByBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block } = req.params;

    if (req.user?.role === "warden" && req.userBlock && block !== req.userBlock) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const students = await Student.find({ block, status: "active" }).sort({ name: 1 });
    const warden = await Warden.findOne({ block });

    const formattedStudents = students.map((s) => ({
      id: s._id.toString(),
      studentId: s.studentId,
      userId: s.userId.toString(),
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      parentMobile: s.parentMobile,
      address: s.address,
      block: s.block,
      roomId: s.roomId?.toString(),
      roomNumber: s.roomNumber,
      bedNumber: s.bedNumber,
      admissionDate: s.admissionDate.toISOString().split("T")[0],
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      wardenName: warden?.name || "Not Assigned",
      wardenMobile: warden?.mobile || "N/A",
    }));

    successResponse(res, formattedStudents);
  } catch (error) {
    console.error("Get students by block error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, mobile, parentMobile, address, block, admissionDate, roomId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      errorResponse(res, "Email already in use", 400);
      return;
    }

    const studentId = await getNextStudentId(block);

    const user = new User({
      email: email.toLowerCase(),
      password: "student123",
      role: "student",
      name,
      mobile,
    });
    await user.save();

    let roomNumber: string | undefined;
    let bedNumber: number | undefined;

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        await User.findByIdAndDelete(user._id);
        errorResponse(res, "Room not found", 404);
        return;
      }

      const occupants = await Student.find({ roomId: room._id, status: "active" }).select("bedNumber _id");
      const usedBeds = new Set<number>(occupants.map((s) => s.bedNumber!).filter((n) => typeof n === "number"));

      let finalBedNumber: number | undefined = undefined;
      for (let i = 1; i <= room.capacity; i++) {
        if (!usedBeds.has(i)) {
          finalBedNumber = i;
          break;
        }
      }

      if (!finalBedNumber) {
        await User.findByIdAndDelete(user._id);
        errorResponse(res, "Room is at full capacity", 400);
        return;
      }

      roomNumber = room.roomNumber;
      bedNumber = finalBedNumber;
      await Room.findByIdAndUpdate(roomId, { $inc: { occupied: 1 } });
    }

    const student = new Student({
      studentId,
      userId: user._id,
      name,
      email: email.toLowerCase(),
      mobile,
      parentMobile,
      address,
      block,
      roomId: roomId || undefined,
      roomNumber,
      bedNumber,
      admissionDate: new Date(admissionDate),
      status: "active",
    });
    await student.save();

    const formattedStudent = {
      id: student._id.toString(),
      studentId: student.studentId,
      userId: student.userId.toString(),
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      parentMobile: student.parentMobile,
      address: student.address,
      block: student.block,
      roomId: student.roomId?.toString(),
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
      admissionDate: student.admissionDate.toISOString().split("T")[0],
      status: student.status,
      createdAt: student.createdAt.toISOString(),
    };

    successResponse(res, formattedStudent, "Student created successfully", 201);
  } catch (error) {
    console.error("Create student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    if (updates.email && updates.email !== student.email) {
      const existingUser = await User.findOne({ email: updates.email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== student.userId.toString()) {
        errorResponse(res, "Email already in use", 400);
        return;
      }
      await User.findByIdAndUpdate(student.userId, { email: updates.email.toLowerCase() });
    }

    if (updates.name) {
      await User.findByIdAndUpdate(student.userId, { name: updates.name });
    }

    if (updates.mobile) {
      await User.findByIdAndUpdate(student.userId, { mobile: updates.mobile });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { ...updates, admissionDate: updates.admissionDate ? new Date(updates.admissionDate) : undefined },
      { new: true }
    );

    if (!updatedStudent) {
      errorResponse(res, "Failed to update student", 500);
      return;
    }

    const formattedStudent = {
      id: updatedStudent._id.toString(),
      studentId: updatedStudent.studentId,
      userId: updatedStudent.userId.toString(),
      name: updatedStudent.name,
      email: updatedStudent.email,
      mobile: updatedStudent.mobile,
      parentMobile: updatedStudent.parentMobile,
      address: updatedStudent.address,
      block: updatedStudent.block,
      roomId: updatedStudent.roomId?.toString(),
      roomNumber: updatedStudent.roomNumber,
      bedNumber: updatedStudent.bedNumber,
      admissionDate: updatedStudent.admissionDate.toISOString().split("T")[0],
      status: updatedStudent.status,
      createdAt: updatedStudent.createdAt.toISOString(),
    };

    successResponse(res, formattedStudent, "Student updated successfully");
  } catch (error) {
    console.error("Update student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    if (student.roomId) {
      await Room.findByIdAndUpdate(student.roomId, { $inc: { occupied: -1 } });
    }

    await Student.findByIdAndUpdate(id, {
      status: "removed",
      roomId: undefined,
      roomNumber: undefined,
      bedNumber: undefined,
    });

    successResponse(res, null, "Student removed from hostel");
  } catch (error) {
    console.error("Delete student error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const allocateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { roomId, bedNumber } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      errorResponse(res, "Student not found", 404);
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      errorResponse(res, "Room not found", 404);
      return;
    }

    const currentRoomId = student.roomId?.toString();

    const occupants = await Student.find({ roomId: room._id, status: "active" }).select("bedNumber _id");
    const usedBeds = new Set<number>(occupants.map((s) => s.bedNumber!).filter((n) => typeof n === "number"));

    let finalBedNumber: number | undefined = undefined;
    if (typeof bedNumber === "number" && bedNumber >= 1 && bedNumber <= room.capacity && !usedBeds.has(bedNumber)) {
      finalBedNumber = bedNumber;
    } else {
      for (let i = 1; i <= room.capacity; i++) {
        if (!usedBeds.has(i)) {
          finalBedNumber = i;
          break;
        }
      }
    }

    if (!finalBedNumber) {
      errorResponse(res, "Room is at full capacity", 400);
      return;
    }

    if (currentRoomId && currentRoomId !== room._id.toString()) {
      await Room.findByIdAndUpdate(currentRoomId, { $inc: { occupied: -1 } });
      await Room.findByIdAndUpdate(room._id, { $inc: { occupied: 1 } });
    } else if (!currentRoomId) {
      await Room.findByIdAndUpdate(room._id, { $inc: { occupied: 1 } });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { roomId: room._id, roomNumber: room.roomNumber, bedNumber: finalBedNumber },
      { new: true }
    );

    if (!updatedStudent) {
      errorResponse(res, "Failed to allocate room", 500);
      return;
    }

    const formattedStudent = {
      id: updatedStudent._id.toString(),
      studentId: updatedStudent.studentId,
      userId: updatedStudent.userId.toString(),
      name: updatedStudent.name,
      email: updatedStudent.email,
      mobile: updatedStudent.mobile,
      parentMobile: updatedStudent.parentMobile,
      address: updatedStudent.address,
      block: updatedStudent.block,
      roomId: updatedStudent.roomId?.toString(),
      roomNumber: updatedStudent.roomNumber,
      bedNumber: updatedStudent.bedNumber,
      admissionDate: updatedStudent.admissionDate.toISOString().split("T")[0],
      status: updatedStudent.status,
      createdAt: updatedStudent.createdAt.toISOString(),
    };

    successResponse(res, formattedStudent, "Room allocated successfully");
  } catch (error) {
    console.error("Allocate room error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const searchByStudentId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId, status: "active" });
    if (!student) {
      successResponse(res, null);
      return;
    }

    const formattedStudent = {
      id: student._id.toString(),
      studentId: student.studentId,
      userId: student.userId.toString(),
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      parentMobile: student.parentMobile,
      address: student.address,
      block: student.block,
      roomId: student.roomId?.toString(),
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
      admissionDate: student.admissionDate.toISOString().split("T")[0],
      status: student.status,
      createdAt: student.createdAt.toISOString(),
    };

    successResponse(res, formattedStudent);
  } catch (error) {
    console.error("Search by student ID error:", error);
    errorResponse(res, "Server error", 500);
  }
};
