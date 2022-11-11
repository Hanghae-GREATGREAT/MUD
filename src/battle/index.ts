import battleAction from './action';
import battleHandler from './battle.Handler';
import encounterHandler from './encounter.Handler';
import fightHandler from './fight.Handler';

export default {
    ...battleAction,
    ...battleHandler,
    ...encounterHandler,
    ...fightHandler,
};
