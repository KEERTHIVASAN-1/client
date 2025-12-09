import { Response } from "express";
import { MessMenu } from "../models/MessMenu";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type MealType = "breakfast" | "lunch" | "dinner";

export const getAllMenuItems = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const menuItems = await MessMenu.find().sort({ day: 1, mealType: 1 });

    const formattedItems = menuItems.map((m) => ({
      id: m._id.toString(),
      day: m.day,
      mealType: m.mealType,
      items: m.items,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    successResponse(res, formattedItems);
  } catch (error) {
    console.error("Get all menu items error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getWeeklyMenu = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const menuItems = await MessMenu.find();

    const menu: Record<string, { breakfast: string[]; lunch: string[]; dinner: string[] }> = {};
    
    const days: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    days.forEach((day) => {
      menu[day] = { breakfast: [], lunch: [], dinner: [] };
    });

    menuItems.forEach((item) => {
      if (menu[item.day]) {
        menu[item.day][item.mealType] = item.items;
      }
    });

    successResponse(res, menu);
  } catch (error) {
    console.error("Get weekly menu error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getMenuByDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { day } = req.params;

    const menuItems = await MessMenu.find({ day }).sort({ mealType: 1 });

    const formattedItems = menuItems.map((m) => ({
      id: m._id.toString(),
      day: m.day,
      mealType: m.mealType,
      items: m.items,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    successResponse(res, formattedItems);
  } catch (error) {
    console.error("Get menu by day error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const getTodayMenu = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = days[new Date().getDay()];

    const menuItems = await MessMenu.find({ day: today }).sort({ mealType: 1 });

    const formattedItems = menuItems.map((m) => ({
      id: m._id.toString(),
      day: m.day,
      mealType: m.mealType,
      items: m.items,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    successResponse(res, formattedItems);
  } catch (error) {
    console.error("Get today menu error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { day, mealType, items } = req.body;

    const menuItem = await MessMenu.findOneAndUpdate(
      { day, mealType },
      { items },
      { new: true, upsert: true }
    );

    const formattedItem = {
      id: menuItem._id.toString(),
      day: menuItem.day,
      mealType: menuItem.mealType,
      items: menuItem.items,
      createdAt: menuItem.createdAt.toISOString(),
      updatedAt: menuItem.updatedAt.toISOString(),
    };

    successResponse(res, formattedItem, "Menu updated");
  } catch (error) {
    console.error("Update menu item error:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const updateWeeklyMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { menu } = req.body;

    for (const [day, meals] of Object.entries(menu)) {
      for (const [mealType, items] of Object.entries(meals as Record<string, string[]>)) {
        await MessMenu.findOneAndUpdate(
          { day, mealType },
          { items },
          { upsert: true }
        );
      }
    }

    successResponse(res, null, "Weekly menu updated");
  } catch (error) {
    console.error("Update weekly menu error:", error);
    errorResponse(res, "Server error", 500);
  }
};
