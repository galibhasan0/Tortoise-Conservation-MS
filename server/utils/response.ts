import { Response } from "express";

export function success(res: Response, data: unknown, statusCode = 200, message?: string) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function fail(res: Response, statusCode: number, message: string, errors?: unknown) {
  return res.status(statusCode).json({ success: false, message, errors });
}

export function paginated(
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
