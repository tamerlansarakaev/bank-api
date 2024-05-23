import { Response } from 'express';

export function handleError(res: Response, error) {
  return res
    .status(error.status || 500)
    .json(error.response.errors || { message: error.message });
}
