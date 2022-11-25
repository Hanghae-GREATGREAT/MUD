import { socket } from '../socket.routes';
import { pvpBattle } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';
// import { pvpBattleCache } from '../db/cache';

// 이렇게 임시보관하는것을 따로 저장해둘 DB나 cache가 있다면 어떨까
import { pvpUsers } from '../handler/pvpBattle/pvpBattle.handler';
export const enemyChoice = new Map();

export default {

    // pvp룸 입장 후 6명이 되기까지 기다리는중
    pvpBattleController: async ({ line, userInfo, userStatus }: SocketInput) => {

        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        const commandHandler: CommandHandler = {
            '도움말': pvpBattle.help,
            '현': pvpBattle.getUsers,
            '돌': pvpBattle.userLeave
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = pvpBattle.wrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);

        // 6명이 채워지면 자동으로 시작
    },

    // 전투가 시작된 후 공격 상대를 고른다.
    enemyChoiceController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        const selectUser = [...pvpUsers];

        // 2가지로 나뉘어한다. 1,2,3번 유저는 4,5,6번 유저를 선택할 수 있고,
        // 4,5,6번 유저는 1,2,3번 유저를 선택할 수 있다.
        // 공격 대상을 지정한 값을 가지고 있을 것이 필요함.
        enemyChoice.set(userInfo.username, selectUser[Number(CMD1)-1])

        // 선택하고 대기하는 필드로 넘기는 로직 필요할듯
        // 키는 선택한 유저, 벨류는 선택된 유저 식으로 저장해두고싶은데...
        const commandHandler: CommandHandler = {
            '도움말': pvpBattle.help,
            1: pvpBattle.selecting,
            2: pvpBattle.selecting,
            // 3: pvpBattle.selecting,
            // 4: pvpBattle.selecting,
            // 5: pvpBattle.selecting,
            // 6: pvpBattle.selecting,
        };

        // 모든 유저가 선택이 끝났는지 확인하는 절차 필요


        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = pvpBattle.wrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);
    },

    // 공격할 수단을 선택
    attackChoiceController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        // 2가지로 나뉘어한다. 1,2,3번 유저는 4,5,6번 유저를 선택할 수 있고,
        // 4,5,6번 유저는 1,2,3번 유저를 선택할 수 있다.
        // 공격 대상을 지정한 값을 가지고 있을 것이 필요함.

        // 선택하고 대기하는 필드로 넘기는 로직 필요할듯
        // 키는 선택한 유저, 벨류는 선택된 스킬 식으로 저장해두고싶은데...
        const commandHandler: CommandHandler = {
            '도움말': pvpBattle.help,
            // 1: pvpBattle.selecting,
            // 2: pvpBattle.selecting,
            // 3: pvpBattle.selecting,
            // 4: pvpBattle.selecting,
            // 5: pvpBattle.selecting,
            // 6: pvpBattle.selecting,
        };

        // 모든 유저가 선택이 끝났는지 확인하는 절차 필요


        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = pvpBattle.wrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);
    },

    // 실제 공격이 이루어진다. 순서대로 스크립트를 보여주는 과정이 필요.
    anemyAttackController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
    },

    // 모든 유저의 1회 공격이 이루어진 후 사망한 유저 확인과 1,2,3번 유저와
    // 4,5,6번 유저의 생존 유무에 따라 그대로 끝낼지, 마을로 보내질지 결정한다.
    // 한쪽 유저들이 패배한다면 pvp룸은 삭제된다. (혹은 모두 나가진다? 마을로 보내진다?)
    pvpResultController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
    }
}

// 이런식으로 추가되게 하고 중복선택 혹은 본인 또는 본인이 속한팀 선택 못하게 구성.

// export const selectTeamA = {
//     1:['test0001','test0004'],
//     2:['test0002','test0005'],
//     3:['test0003','test0006']
// }

// export const selectTeamB = {
//     1:['test0004','test0001'],
//     2:['test0005','test0002'],
//     3:['test0006','test0003']
// }