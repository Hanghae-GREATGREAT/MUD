import { HttpException } from '../common';
import { redis } from '../db/cache';
import { UserInfo, UserStatus } from '../interfaces/user';
import BATTLE from '../redis';
import { homeScript, dungeonScript, battleScript } from '../scripts';
import { UserService, DungeonService, MonsterService } from '../services';

export default {
    dungeonList: (socketId: string, userInfo: UserInfo): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            const result = await UserService.checkUser(userInfo);
            if (result) {
                const script = homeScript.loadHome;
                const field = 'front';
                BATTLE.to(socketId).emit('print', { script, userInfo, field });
                return resolve();
            }
            // 던전 목록 불러오기
            const dungeonList = DungeonService.getDungeonList();

            const script = `=======================================================================
            ${userInfo?.name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n
            ${dungeonList}`;
            const field = 'dungeon';

            BATTLE.to(socketId).emit('print', { field, script, userInfo, chat: true });
            resolve();
        });
    },

    dungeonInfo: (socketId: string, CMD: string, userInfo: UserInfo) => {
        let script = '';
        let field = '';

        // 던전 정보 불러오기
        const dungeonInfo = DungeonService.getDungeonInfo(Number(CMD));
        if (!dungeonInfo) {
            script = dungeonScript.wrong(CMD);
            field = 'dungeon';
        } else {
            script = dungeonInfo + dungeonScript.enter;

            const { characterId } = userInfo;
            redis.battleSet(characterId, { dungeonLevel: +CMD });
            field = 'battle';
        }

        console.log(field);
        BATTLE.to(socketId).emit('print', { field, script, userInfo });
    },

    encounter: (socketId: string, userInfo: UserInfo, userStatus: UserStatus): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            const { characterId } = userInfo;
            const { dungeonLevel } = await redis.battleGet(characterId);
            if (!dungeonLevel || !characterId) {
                const error = new HttpException('encounter cache error: dungeonLevel missing', 500, socketId);
                return reject(error);
            }

            // 적 생성
            const { name, monsterId } = await MonsterService.createNewMonster(dungeonLevel, characterId);

            // 던전 진행상황 업데이트
            redis.battleSet(characterId, { monsterId });

            const script = battleScript.encounter(name);
            const field = 'encounter';

            BATTLE.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
            resolve();
        });
    },
};
