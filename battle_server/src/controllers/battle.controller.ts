import { NextFunction, Request, Response } from 'express';
import BATTLE from '../redis';
import { HttpException } from '../common';
import { autoBattleHandler, battleHandler, dungeonHandler } from '../handlers';
import { battleScript } from '../scripts';
import { PostBody } from '../interfaces/common';

export default {
    help: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        const script = battleScript.help;
        const field = 'battle';

        BATTLE.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },
    battleHelp: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo || !CMD) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        const script = battleScript.battleHelp(CMD);
        const field = 'action';

        BATTLE.to(socketId).emit('printBattle', { field, script, userInfo });

        res.status(200).end();
    },
    encounterHelp: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        const script = battleScript.encounterHelp;
        const field = 'encounter';

        BATTLE.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },
    autoHelp: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo || !CMD) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        const script = battleScript.autoHelp(CMD);
        const field = 'autoBattle';

        BATTLE.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },
    autoHelpS: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo || !CMD) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        const script = battleScript.autoHelp(CMD);
        const field = 'autoBattleS';

        BATTLE.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },

    encounter: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, userStatus }: PostBody = req.body;
        if (!userInfo || !userStatus) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        dungeonHandler
            .encounter(socketId, userInfo, userStatus)
            .then(() => {
                res.status(200).end();
            })
            .catch((error) => next(error));
    },
    attack: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, userStatus }: PostBody = req.body;
        if (!userInfo || !userStatus) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        battleHandler
            .attack(socketId, userInfo, userStatus)
            .then(() => {
                res.status(200).end();
            })
            .catch((error) => next(error));
    },
    quit: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        battleHandler.quit(socketId, userInfo);

        res.status(200).end();
    },
    action: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        if (!userInfo || !userStatus || !CMD) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        if (CMD === '중단' || CMD === 'S' || CMD === 'STOP') {
            console.log('battle.controller.ts: action stop', userInfo.characterId);
            const error = battleHandler.stopAuto(socketId, userInfo);
            error ? next(error) : res.status(200).end();
            return;
        } else if (!CMD.match(/1|2|3/)) {
            console.log('battle.controller.ts: action wrong', userInfo.characterId);
            const script = battleScript.battleHelp(CMD);
            const field = 'action';

            BATTLE.to(socketId).emit('printBattle', { field, script, userInfo });
            return;
        }

        battleHandler
            .skill(socketId, CMD, userInfo, userStatus)
            .then(() => {
                res.status(200).end();
            })
            .catch((error) => next(error));
    },

    autoBattle: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        if (!userInfo || !userStatus) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        autoBattleHandler
            .autoBattle(socketId, userInfo, userStatus)
            .then(() => {
                res.status(200).end();
            })
            .catch((error) => next(error));
    },
    autoBattleWorker: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, userStatus }: PostBody = req.body;
        if (!userInfo || !userStatus) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        autoBattleHandler
            .autoBattleWorker(socketId, userStatus)
            .then(() => {
                res.status(200).end();
            })
            .catch((error) => next(error));
    },
    autoQuit: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        battleHandler.stopAutoWorker(socketId, userInfo);
        res.status(200).end();
    },
    autoQuitS: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400, socketId);
            return next(error);
        }

        battleHandler.stopAutoS(socketId, userInfo);
        res.status(200).end();
    },
};
