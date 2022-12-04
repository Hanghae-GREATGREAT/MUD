import { Characters } from "../db/models";
import { rooms } from "../handler/pvpBattle/pvpList.handler";

class PvpBattleService {

    hitStrength(damage: number): number {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        return Math.floor((damage * hitStrength) / 100);
    }

    // attackChoiceValidation(line: string, roomName: string, name: string) :void {
    //     const [CMD1, CMD2]: string[] = line.trim().split(' ');
    //     const pvpRoom = rooms.get(roomName);
    //     const playerInfo = pvpRoom!.get(name)
    //     const userStatus = playerInfo?.userStatus

    //     if (playerInfo!.target === 'none' || playerInfo!.target === 'dead') return pvpBattle.enemyChoiceWrongCommand(socket, '관전 중에는 입력하지 못합니다.', userInfo);
    //     if (!CMD2) return pvpBattle.attackChoiceWrongCommand(socket, CMD2, userInfo);
    //     if (CMD1==='1' && CMD2 === '기본공격') return pvpBattle.selectSkills(socket, CMD2, userInfo, userStatus);
    //     if (CMD1==='1' && CMD2 !== '기본공격') return pvpBattle.attackChoiceWrongCommand(socket, CMD2, userInfo);
    //     if (!userStatus!.skill[Number(CMD1)-2]) return pvpBattle.isSkills(socket, CMD2, userInfo, userStatus);
    //     if (userStatus!.skill[Number(CMD1)-2].name !== CMD2) return pvpBattle.isSkills(socket, CMD2, userInfo, userStatus);
    // }
}

export default new PvpBattleService();