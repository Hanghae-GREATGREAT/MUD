import pvpBattleHandler from './pvpBattle.handler';
import enemyChoice from './enemyChoice.handler';
import attackChoice from './attackChoice.handler';
import enemyAttack from './enemyAttack.handler';
import pvpResult from './pvpResult.handler';

export default {
    ...pvpBattleHandler,
    ...enemyChoice,
    ...attackChoice,
    ...enemyAttack,
    ...pvpResult,
};
