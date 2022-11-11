import battleAction from './action';
import battleHandler from './battle.Handler';
import encounterHandler from './encounter.Handler';
import fightHandler from './fight.Handler';
import adventureResult from './adventureResult.handler';

export default {
    ...battleAction,
    ...battleHandler,
    ...encounterHandler,
    ...fightHandler,
    ...adventureResult,
};
