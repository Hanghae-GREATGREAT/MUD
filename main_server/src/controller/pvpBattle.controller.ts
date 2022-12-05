import { Socket } from 'socket.io';
import env from '../config.env';
import { village } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandRouter } from '../interfaces/socket';


const PVP_URL = `http://${env.HOST}:${env.PVP_PORT}`

export default {

    // pvp룸 생성 및 입장
    pvpListController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        // const [CMD1, CMD2]: string[] = line.trim().split(' ');

        // if (CMD1 === '도움말') return pvpBattle.pvpListHelp(socket, CMD2, userInfo);
        // else if (CMD1 === '돌'|| CMD1 === '돌아가기') return village.NpcList(socket, CMD2, userInfo);
        // else if (!CMD2) return pvpBattle.pvpListWrongCommand(socket, '방이름을 입력해주세요', userInfo)

        // const commandHandler: CommandHandler = {
        //     '1': pvpBattle.createRoom,
        //     '2': pvpBattle.joinRoom
        // };

        // if (!commandHandler[CMD1]) {
        //     return pvpBattle.pvpListWrongCommand(socket, CMD1, userInfo);
        // }

        // commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        
        if (CMD1 === '돌'|| CMD1 === '돌아가기') return village.NpcList(socket, CMD2, userInfo);
        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpList' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '1': 'createRoom',
            '2': 'joinRoom'
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpList' })
            return;
        }
        // if (!CMD2) {
        //     const URL = `${PVP_URL}/pvp/wrongCommand`
        //     fetchPost({ URL, socketId: socket.id, CMD: '방이름을 입력해주세요', userInfo })
        //     return;
        // }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus })
    },

    // pvp룸 입장 후 6명이 되기까지 기다리는중
    pvpBattleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        // const [CMD1, CMD2]: string[] = line.trim().split(' ');
        // const commandHandler: CommandHandler = {
        //     '도움말': pvpBattle.pvpBattleHelp,
        //     '현': pvpBattle.getUsers,
        //     '돌': pvpBattle.userLeave
        // };

        // if (!commandHandler[CMD1]) {
        //     console.log(`is wrong command : '${CMD1}'`);
        //     pvpBattle.pvpBattleWrongCommand(socket, CMD1, userInfo);
        //     return;
        // }

        // commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpBattle' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '현': 'getUsers',
            '돌': 'leaveRoom'
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpBattle' })
            return;
        }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus });
    },

    // 전투가 시작된 후 공격 상대를 고른다.
    enemyChoiceController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {    
        // const [CMD1, CMD2]: string[] = line.trim().split(' ');
        // const roomName = userStatus.pvpRoom;
        // const userNames: string[] = [];
        // const pvpRoom = rooms.get(roomName!);
        // const isDead = pvpRoom!.get(userInfo.username)!.target

        // // 사망한 유저인지 확인
        // if (isDead === 'none' || isDead === 'dead') return pvpBattle.enemyChoiceWrongCommand(socket, '관전 중에는 입력하지 못합니다.', userInfo);

        // // 본인 선택시 예외처리로직 시작
        // const iterator = pvpRoom!.values();
        // for (let i = 0; i < maxUsers; i++) {
        //     userNames.push(iterator.next().value.userStatus.name);
        // }
        
        // // 본인의 index를 확인
        // const myIndex = userNames.findIndex((e)=>e===userStatus.name);
        
        // // 유저가 속한 팀이아닌 상대팀만을 선택
        // if (myIndex < 2 && Number(CMD1)-1 < 2) return pvpBattle.selectWrong(socket, CMD1, userInfo, userStatus);
        // else if (myIndex >= 2 && Number(CMD1)-1 >= 2) return pvpBattle.selectWrong(socket, CMD1, userInfo, userStatus);
        // else if (Number(CMD1) > maxUsers) return pvpBattle.selectWrong(socket, CMD1, userInfo, userStatus);
        
        // // 이미 사망한 유저를 선택하지 못한다.
        // const dontSelect = await Characters.findOne({ where: { name: userNames[Number(CMD1)-1] }})
        // if (dontSelect!.hp === 0) return pvpBattle.selectWrong(socket, CMD2, userInfo, userStatus)

        // pvpRoom!.get(userInfo.username)!.target = userNames[Number(CMD1)-1];
        
        // const commandHandler: CommandHandler = {
        //     '도움말': pvpBattle.enemyChoiceHelp,
        //     '1': pvpBattle.selecting,
        //     '2': pvpBattle.selecting,
        //     '3': pvpBattle.selecting,
        //     '4': pvpBattle.selecting,
        //     // '5': pvpBattle.selecting,
        //     // '6': pvpBattle.selecting,
        // };

        // if (!commandHandler[CMD1]) {
        //     console.log(`is wrong command : '${CMD1}'`);
        //     pvpBattle.enemyChoiceWrongCommand(socket, CMD1, userInfo);
        //     return;
        // }

        // commandHandler[CMD1](socket, CMD2, userInfo, userStatus);

        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'enemyChoice' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '1': 'target',
            '2': 'target',
            '3': 'target',
            '4': 'target',
            '5': 'target',
            '6': 'target',
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'enemyChoice' })
            return;
        }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, userStatus });

    },

    // 공격할 수단을 선택
    // 2가지로 나뉘어한다. 
    // 1,2,3번 유저는 4,5,6번 유저를 선택할 수 있고,
    // 4,5,6번 유저는 1,2,3번 유저를 선택할 수 있다.
    // 공격 대상을 지정한 값을 가지고 있을 것이 필요함.
    attackChoiceController: (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        // const [CMD1, CMD2]: string[] = line.trim().split(' ');
        // const pvpRoom = rooms.get(userStatus.pvpRoom!);
        // const isDead = pvpRoom!.get(userInfo.username)!.target

        // // 커맨드 예외처리, 유저가 가진 스킬만을 사용할 수 있다.
        // if (CMD1 === '도움말') return pvpBattle.attackChoiceHelp(socket, CMD1, userInfo, userStatus);
        // if (isDead === 'none' || isDead === 'dead') return pvpBattle.enemyChoiceWrongCommand(socket, '관전 중에는 입력하지 못합니다.', userInfo);
        // if (!CMD2) return pvpBattle.attackChoiceWrongCommand(socket, CMD2, userInfo);
        // if (CMD1==='1' && CMD2 === '기본공격') return pvpBattle.selectSkills(socket, CMD2, userInfo, userStatus);
        // if (CMD1==='1' && CMD2 !== '기본공격') return pvpBattle.attackChoiceWrongCommand(socket, CMD2, userInfo);
        // if (!userStatus.skill[Number(CMD1)-2]) return pvpBattle.isSkills(socket, CMD2, userInfo, userStatus);
        // if (userStatus.skill[Number(CMD1)-2].name !== CMD2) return pvpBattle.isSkills(socket, CMD2, userInfo, userStatus);

        // const commandHandler: CommandHandler = {
        //     2: pvpBattle.selectSkills,
        //     3: pvpBattle.selectSkills,
        //     4: pvpBattle.selectSkills,
        // };

        // if (!commandHandler[CMD1]) {
        //     console.log(`is wrong command : '${CMD1}'`);
        //     pvpBattle.attackChoiceWrongCommand(socket, CMD1, userInfo);
        //     return;
        // }

        // commandHandler[CMD1](socket, CMD2, userInfo, userStatus);

        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'attackChoice' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '1': 'pickSkill',
            '2': 'pickSkill',
            '3': 'pickSkill',
            '4': 'pickSkill',
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'attackChoice' })
            return;
        }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: line, userInfo, userStatus });
    },


    // anemyAttackController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
    //     const [CMD1, CMD2]: string[] = line.trim().split(' ');
    // },

    // 1회 공격이 이루어지고 결과를 출력, 한팀이 전멸시 승리팀 표시
    // hp 회복 후 마을로 보내진다.
    // pvpResultController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
    //     const [CMD1, CMD2]: string[] = line.trim().split(' ');
    // }
}