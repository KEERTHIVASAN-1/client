import type { Express } from "express";
import type { Server } from "http";
import { connectDatabase } from "./config/database";
import apiRoutes from "./apiRoutes";
import { seedAdmin } from "./seeds/adminSeed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await connectDatabase();
  
  await seedAdmin();

  app.use("/api", apiRoutes);

  return httpServer;
}
