import { parentPort, workerData, getEnvironmentData, MessagePort } from 'worker_threads'
import { PvpUsersWorkerData} from '../interfaces/worker';
import redis from '../db/cache/redis';
import { maxUsers } from '../controllers/pvp.controller';
import PVP from '../redis';
import { isEnd } from '../services/pvp.service';

console.log('pvpUsers.worker.ts: 8 >> 자동공격 워커 모듈 동작, ', workerData.userStatus.characterId)

parentPort?.once('message', (userStatus) => {
    pvpUsersWorker(workerData);
    console.log('pvpUsers.worker.ts: 12 >>', workerData.socketId, userStatus.name)
});

function pvpUsersWorker({ userStatus, path }: PvpUsersWorkerData) {    

    const { characterId } = userStatus;
    console.log('pvpUsers.worker.ts: 18 >> pvpUsersWorker() 시작', characterId);
    let cnt = 1
    const roomName = userStatus.pvpRoom;
    if (!isEnd.get(roomName!)?.isPause) {
        const pvpUsersTimer = setInterval(async () => {
            let script = `= TEAM. =Lv. =========== Deamge ======== HP ================ Name======\n`;
            const pvpRoom = await redis.hGetPvpRoom(roomName!);
            const users = Object.entries(pvpRoom)
    
            // 캐릭터별 이름, 레벨, 체력, 공격력, 방어력 표시
            for (const user of users) {
                const userInfo = {
                    isTeam: user[1].userStatus.isTeam!,
                    level: String(user[1].userStatus.level).padEnd(4, `.`),
                    damage: String(user[1].userStatus.damage!).padStart(17, `.`),
                    hp: String(user[1].userStatus.hp).padStart(9, `.`),
                    maxhp: String(user[1].userStatus.maxhp).padEnd(9, `.`),
                    name: user[1].userStatus.name
                }
                script += `#${userInfo.isTeam}  #${userInfo.level}#${userInfo.damage}#${userInfo.hp} / ${userInfo.maxhp}#  ${userInfo.name}\n`;
            }
            const field = `pvpBattle`;
            PVP.to(roomName!).emit('fieldScriptPrint', { script, field });
    
            const tempLine: string = `=======================================================================\n\n기본공격, `;
            let skillScript: string = '';
            for (let y = 0; y < maxUsers; y++) {
                const user = users[y][1].userStatus
                for (let i = 0; i < user!.skill.length; i++) {
                    let skills = user!.skill[i]
                        skillScript += `${skills.name}, `
                }
            const script2 = tempLine + skillScript;
            PVP.to(users[y][1].socketId).emit('printBattle', { script: `${script2}\n\n`, field, userStatus: user });
            skillScript = '';
            }
            console.log(`pvpUsers.worker.ts: 47 >> pvpUsersWorker() ${cnt++}회 작동중`)
        }, 5000);
        isEnd.set(roomName!, { isPause: false, timer: pvpUsersTimer })
    }


    return;
}
