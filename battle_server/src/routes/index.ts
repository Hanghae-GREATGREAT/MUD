import { Router } from 'express';
import battleRouter from './battle.routes';
import dungeonRouter from './dungeon.routes';


const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'BATTLE SERVER'
    });
});


export {
    battleRouter,
    dungeonRouter,
}