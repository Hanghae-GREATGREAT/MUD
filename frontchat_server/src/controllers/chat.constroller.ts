import { NextFunction, Request, Response } from 'express';
import { PostBody } from '../interfaces/common';

export default {
    submit: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        res.status(200).end();
    },
};
