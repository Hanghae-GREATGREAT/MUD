import { Request, Response, NextFunction } from 'express';
import { errorReport, HttpException } from "../common";


export const errorHandler = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    errorReport(err);
    res.status(err.status).end();
}
