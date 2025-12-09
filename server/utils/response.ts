import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const successResponse = <T>(res: Response, data: T, message?: string, statusCode = 200): void => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (res: Response, message: string, statusCode = 400): void => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number
): void => {
  res.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
};
