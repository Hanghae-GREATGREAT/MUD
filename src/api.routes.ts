import { Router } from 'express';
// import UserRouter from './user/user.routes';
// import BattleRouter from './battle/battle.routes';
// import ItemRouter from './item/item.routes';
// import SkillRouter from './skill/skill.routes';
// import MonsterRouter from './monster/monster.routes';

// import auth from './middlewares/auth';

const router = Router();

router.get('/', async (req, res, next) => {
    console.log('APIIIIIIIIIIIIIIII')

    res.status(200).json({
        message: 'API INDEX',
    });
});


// router.use('/user', UserRouter);
// router.use('/battle', BattleRouter);
// router.use('/items', ItemRouter);
// router.use('/skills', SkillRouter);
// router.use('/monster', MonsterRouter);


export default router;
