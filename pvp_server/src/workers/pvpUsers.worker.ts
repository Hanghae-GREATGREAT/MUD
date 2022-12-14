import { parentPort } from 'worker_threads'
import redis from '../db/cache/redis';
import { maxUsers } from '../controllers/pvp.controller';
import PVP from '../redis';
import { isEnd } from '../services/pvp.service';
import { UserStatus } from '../interfaces/user';

parentPort?.once('message', (userStatus: UserStatus) => {
    pvpUsersWorker(userStatus);
});

async function pvpUsersWorker(userStatus: UserStatus) {    
    const roomName = userStatus.pvpRoom;
    
    const pvpUsersTimer = setInterval(async () => {
        const firstLine = `= TEAM. =Lv. =========== Deamge ======== HP ================ Name======\n`;
        let ATeamScript: string = ``;
        let BTeamScript: string = ``;
        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom)
        if (!users[0]) {
            clearInterval(pvpUsersTimer)
            return;
        } 

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
            if (userInfo.isTeam === 'A TEAM') ATeamScript += `#<span style='color:red'>${userInfo.isTeam}</span>  #${userInfo.level}#${userInfo.damage}#${userInfo.hp} / ${userInfo.maxhp}#  <span style='color:red'>${userInfo.name}</span>\n`;
            else if (userInfo.isTeam === 'B TEAM') BTeamScript += `#<span style='color:#3333FF'>${userInfo.isTeam}</span>  #${userInfo.level}#${userInfo.damage}#${userInfo.hp} / ${userInfo.maxhp}#  <span style='color:#3333FF'>${userInfo.name}</span>\n`;
        }
        const field = `pvpBattle`;
        const script = firstLine + ATeamScript + BTeamScript
        PVP.to(roomName!).emit('fieldScriptPrint', { script, field });

        const tempLine: string = `=======================================================================\n\n<span style='color:yellow'>기본공격, </span>`;
        let skillScript: string = '';
        for (let y = 0; y < maxUsers; y++) {
            if (!users[y]) continue;
            const user = users[y][1].userStatus
            for (let i = 0; i < user!.skill.length; i++) {
                let skills = user!.skill[i]
                    skillScript += `<span style='color:yellow'>${skills.name}, </span>`
            }
        const script2 = tempLine + skillScript;
        PVP.to(users[y][1].socketId).emit('printBattle', { script: `${script2}\n\n`, field, userStatus: user });
        skillScript = '';
        }
    }, 1000 * 10);
    isEnd.set(roomName!, pvpUsersTimer)
    return;
}
