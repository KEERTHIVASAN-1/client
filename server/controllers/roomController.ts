import { Response } from "express";
import { Room } from "../models/Room";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

export const getAllRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, block, search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);

    const query: any = {};

    if (req.user?.role === "warden" && req.userBlock) {
      query.block = req.userBlock;
    } else if (block) {
      query.block = block;
    }

    if (search) {
      query.roomNumber = new RegExp(search as string, "i");
    }

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .sort({ block: 1, roomNumber: 1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    const formattedRooms = rooms.map((r) => ({
      id: r._id.toString(),
      roomNumber: r.roomNumber,
      block: r.block,
      floor: r.floor,
      capacity: r.capacity,
      occupied: r.occupied,
      createdAt: r.createdAt.toISOString(),
    }));

    paginatedResponse(res, formattedRooms, total, pageNum, pageSizeNum);
  } catch (error) {
    console.error("Get all rooms error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      errorResponse(res, "Room not found", 404);
      return;
    }

    const formattedRoom = {
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
      occupied: room.occupied,
      createdAt: room.createdAt.toISOString(),
    };

    successResponse(res, formattedRoom);
  } catch (error) {
    console.error("Get room by ID error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getRoomsByBlock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block } = req.params;

    const rooms = await Room.find({ block }).sort({ roomNumber: 1 });

    const formattedRooms = rooms.map((r) => ({
      id: r._id.toString(),
      roomNumber: r.roomNumber,
      block: r.block,
      floor: r.floor,
      capacity: r.capacity,
      occupied: r.occupied,
      createdAt: r.createdAt.toISOString(),
    }));

    successResponse(res, formattedRooms);
  } catch (error) {
    console.error("Get rooms by block error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getAvailableRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { block } = req.query;

    const query: any = { $expr: { $lt: ["$occupied", "$capacity"] } };
    if (block) {
      query.block = block;
    }

    const rooms = await Room.find(query).sort({ block: 1, roomNumber: 1 });

    const formattedRooms = rooms.map((r) => ({
      id: r._id.toString(),
      roomNumber: r.roomNumber,
      block: r.block,
      floor: r.floor,
      capacity: r.capacity,
      occupied: r.occupied,
      createdAt: r.createdAt.toISOString(),
    }));

    successResponse(res, formattedRooms);
  } catch (error) {
    console.error("Get available rooms error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomNumber, block, floor, capacity } = req.body;

    const existingRoom = await Room.findOne({ block, roomNumber });
    if (existingRoom) {
      errorResponse(res, `Room ${roomNumber} already exists in Block ${block}`, 400);
      return;
    }

    const room = new Room({
      roomNumber,
      block,
      floor,
      capacity,
      occupied: 0,
    });
    await room.save();

    const formattedRoom = {
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
      occupied: room.occupied,
      createdAt: room.createdAt.toISOString(),
    };

    successResponse(res, formattedRoom, "Room created successfully", 201);
  } catch (error) {
    console.error("Create room error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const room = await Room.findById(id);
    if (!room) {
      errorResponse(res, "Room not found", 404);
      return;
    }

    if (updates.roomNumber || updates.block) {
      const existingRoom = await Room.findOne({
        block: updates.block || room.block,
        roomNumber: updates.roomNumber || room.roomNumber,
        _id: { $ne: id },
      });
      if (existingRoom) {
        errorResponse(res, "Room number already exists in this block", 400);
        return;
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedRoom) {
      errorResponse(res, "Failed to update room", 500);
      return;
    }

    const formattedRoom = {
      id: updatedRoom._id.toString(),
      roomNumber: updatedRoom.roomNumber,
      block: updatedRoom.block,
      floor: updatedRoom.floor,
      capacity: updatedRoom.capacity,
      occupied: updatedRoom.occupied,
      createdAt: updatedRoom.createdAt.toISOString(),
    };

    successResponse(res, formattedRoom, "Room updated successfully");
  } catch (error) {
    console.error("Update room error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      errorResponse(res, "Room not found", 404);
      return;
    }

    if (room.occupied > 0) {
      errorResponse(res, "Cannot delete room with students", 400);
      return;
    }

    await Room.findByIdAndDelete(id);

    successResponse(res, null, "Room deleted successfully");
  } catch (error) {
    console.error("Delete room error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateOccupancy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { occupied } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      errorResponse(res, "Room not found", 404);
      return;
    }

    if (occupied > room.capacity) {
      errorResponse(res, "Occupancy cannot exceed capacity", 400);
      return;
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, { occupied }, { new: true });

    if (!updatedRoom) {
      errorResponse(res, "Failed to update room", 500);
      return;
    }

    const formattedRoom = {
      id: updatedRoom._id.toString(),
      roomNumber: updatedRoom.roomNumber,
      block: updatedRoom.block,
      floor: updatedRoom.floor,
      capacity: updatedRoom.capacity,
      occupied: updatedRoom.occupied,
      createdAt: updatedRoom.createdAt.toISOString(),
    };

    successResponse(res, formattedRoom, "Room occupancy updated");
  } catch (error) {
    console.error("Update occupancy error:", error);
    errorResponse(res, "Server error", 500);
  }
};
