import { Response } from "express";

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  error?: T | null;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T | null,
  error?: T | null,
): Response => {
  const response: ApiResponse<T> = {
    statusCode,
    success,
    message,
    data: data ?? null, // Ensures `null` if data is undefined or missing
    error: error ?? null, // Ensures `null` if error is undefined or missing
  };
  return res.status(statusCode).json(response);
};
