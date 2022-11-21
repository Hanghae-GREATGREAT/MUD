import adventureResult from './result.handler';
import autoBattle from './auto.handler';
import battleHandler from './battle.handler';
import encounterHandler from './encounter.handler';

export default {
    ...adventureResult,
    ...autoBattle,
    ...battleHandler,
    ...encounterHandler,
};
