"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_routes_1 = require("../../socket.routes");
const models_1 = require("../../db/models");
const services_1 = require("../../services");
const cache_1 = require("../../db/cache");
const __1 = require("..");
exports.default = {
    // help: (CMD: string | undefined, user: UserSession) => {}
    help: (CMD, user) => {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        tempScript += '명령어 : \n';
        tempScript += '[수동] 전투 진행 - 수동 전투를 진행합니다.\n';
        tempScript += '[자동] 전투 진행 - 자동 전투를 진행합니다.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';
        const script = tempLine + tempScript;
        const field = 'battle';
        return { script, user, field };
    },
    autoAttack: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        let tempScript = '';
        let field = 'action';
        const { characterId } = user;
        const { autoAttackId } = cache_1.battleCache.get(characterId);
        const { monsterId } = yield cache_1.redis.hGetAll(characterId);
        console.log(yield cache_1.redis.hGetAll(characterId));
        // 유저&몬스터 정보 불러오기
        const { hp: playerHP, attack: playerDamage } = yield services_1.CharacterService.findByPk(characterId);
        const monster = yield models_1.Monsters.findByPk(monsterId);
        if (!autoAttackId || !monster) {
            return { script: '내부에러', field: 'dungeon', user, error: true };
        }
        const { name: monsterName, hp: monsterHP, attack: monsterDamage, exp: monsterExp } = monster;
        // 유저 턴
        console.log('유저턴');
        const playerHit = services_1.BattleService.hitStrength(playerDamage);
        const playerAdjective = services_1.BattleService.dmageAdjective(playerHit, playerDamage);
        tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;
        const isDead = yield services_1.MonsterService.refreshStatus(monsterId, playerHit, characterId);
        if (!isDead)
            throw new Error('몬스터 정보를 찾을 수 없습니다');
        if (isDead === 'dead') {
            console.log('몬스터 사망');
            // battleCache.set(characterId, { dead: 'monster' });
            yield cache_1.redis.hSet(characterId, { dead: 'monster' });
            const { script, field, user } = yield __1.battle.resultMonsterDead(monster, tempScript);
            return { script, field, user };
        }
        // 몬스터 턴
        console.log('몬스터 턴');
        const monsterHit = services_1.BattleService.hitStrength(monsterDamage);
        const monsterAdjective = services_1.BattleService.dmageAdjective(monsterHit, monsterDamage);
        tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;
        user = yield services_1.CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);
        if (user.isDead === 'dead') {
            console.log('유저 사망');
            field = 'adventureResult';
            tempScript += '\n!! 치명상 !!\n';
            tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;
            // battleCache.set(characterId, { dead: 'player' });
            yield cache_1.redis.hSet(characterId, { dead: 'player' });
        }
        const script = tempScript;
        return { script, user, field };
    }),
    resultMonsterDead: (monster, script) => __awaiter(void 0, void 0, void 0, function* () {
        const { characterId, name: monsterName, exp: monsterExp } = monster;
        const user = yield services_1.CharacterService.addExp(characterId, monsterExp);
        const field = 'encounter';
        script += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;
        if (user.levelup) {
            script += `\n==!! LEVEL UP !! 레벨이 ${user.level - 1} => ${user.level} 올랐습니다 !! LEVEL UP !!==\n\n`;
        }
        return { script, user, field };
    }),
    autoBattle: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        console.timeEnd('AUTOBATTLEEEEEEEEEEEEEEEEEEE');
        let tempScript = '';
        let field = 'action';
        const { characterId } = user;
        console.log('autoBattleeeeeeeeeeeeeeeee', yield cache_1.redis.hGetAll(characterId));
        const { dungeonLevel } = yield cache_1.redis.hGetAll(characterId);
        // const { dungeonLevel } = battleCache.get(characterId);
        // 몬스터 생성
        const { monsterId, name } = yield services_1.MonsterService.createNewMonster(dungeonLevel, characterId);
        const monsterCreatedScript = `\n${name}이(가) 등장했습니다.\n\n`;
        yield cache_1.redis.hSet(characterId, { monsterId });
        // battleCache.set(characterId, dungeonSession);
        console.log('몬스터 생성', yield cache_1.redis.hGetAll(characterId));
        socket_routes_1.socket.emit('printBattle', { script: monsterCreatedScript, field, user });
        // 자동공격 사이클
        const autoAttackId = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            console.time('AUTOBATTLEEEEEEEEEEEEEEEEEEE');
            cache_1.battleCache.set(characterId, { autoAttackId });
            const { script, user: newUser, error } = yield __1.battle.autoAttack(CMD, user);
            // 이미 끝난 전투
            if (error)
                return console.timeEnd('AUTOBATTLEEEEEEEEEEEEEEEEEEE');
            ;
            // 자동공격 스크립트 계속 출력?
            const field = 'autoBattle';
            socket_routes_1.socket.emit('printBattle', { script, field, user: newUser });
            const whoIsDead = {
                'player': __1.dungeon.getDungeonList,
                'monster': __1.battle.autoBattle,
            };
            // dead = 'moster'|'player'|undefined
            // const { dead } = battleCache.get(characterId);
            const { dead } = yield cache_1.redis.hGetAll(characterId);
            if (dead) {
                const { autoAttackId } = cache_1.battleCache.get(characterId);
                clearInterval(autoAttackId);
                cache_1.battleCache.delete(characterId);
                cache_1.redis.hDelBattleCache(characterId);
                if (dead === 'monster')
                    yield cache_1.redis.hSet(characterId, { dungeonLevel });
                const { script, field, user } = yield whoIsDead[dead]('', newUser);
                socket_routes_1.socket.emit('printBattle', { script, field, user });
                return;
            }
            else {
                // 스킬공격 사이클. 50% 확률로 발생
                const chance = Math.random();
                if (chance < 0.5)
                    return console.timeEnd('AUTOBATTLEEEEEEEEEEEEEEEEEEE');
                ;
                const { script, user, field } = yield __1.battle.autoBattleSkill(newUser);
                const { dead } = yield cache_1.redis.hGetAll(characterId);
                socket_routes_1.socket.emit('printBattle', { script, field, user });
                if (dead) {
                    const { autoAttackId } = cache_1.battleCache.get(characterId);
                    clearInterval(autoAttackId);
                    cache_1.battleCache.delete(characterId);
                    yield cache_1.redis.hDelResetCache(characterId);
                    const { script, field, user } = yield whoIsDead[dead]('', newUser);
                    socket_routes_1.socket.emit('printBattle', { script, field, user });
                    return;
                }
                console.timeEnd('AUTOBATTLEEEEEEEEEEEEEEEEEEE');
            }
        }), 1500);
        // battleLoops.set(characterId, autoAttackId);
        // 스킬공격 사이클을 일반공격 사이클과 분리하는 것이 좋은가? 아니면 같은 사이클에서 돌리는 것이 나은가?
        // 일단 사망 판정 관리 때문에 하나로
        return { script: tempScript, user, field };
    }),
    wrongCommand: (CMD, user) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'battle';
        return { script, user, field };
    },
};
