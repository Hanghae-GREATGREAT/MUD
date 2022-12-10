interface ChatJoinerInterface {
    [key: string]: string;
}

class ChatCache {
    private roomList: Map<number, Set<string>>;
    private pvpRoomList: Map<string, Set<string>>;
    private chatJoiner: ChatJoinerInterface = {};
    private pvpChatJoiner: ChatJoinerInterface = {};
    // 채팅방 입장 정원
    private setJoinerLimit: number = 5;
    private pvpSetJoinerLimit: number = 10;

    constructor() {
        this.roomList = new Map();
        this.pvpRoomList = new Map();
    }

    joinChat(socketId: string): Array<number> {
        // 입장 정원 설정
        // const setJoinerLimit = 5;

        // tempData
        let accessibleIndex = 1;
        let enteredIndex: number;
        let joinerSize = 1;

        // 아무도 없다면 최초 채팅방 생성
        if (this.roomList.size === 0) {
            this.roomList.set(accessibleIndex, new Set([socketId]));

            this.chatJoiner[socketId] = `${accessibleIndex}`;
            // console.log('roomList : ', this.roomList);
            // console.log('chatJoiner : ', this.chatJoiner);

            return [accessibleIndex, joinerSize, this.setJoinerLimit];
        }

        // 입장 가능한 채팅방 탐색
        for (let i = 1; i <= this.roomList.size; i++) {
            const room = this.roomList.get(i);
            if (!room) continue;

            joinerSize = room.size;
            if (joinerSize < this.setJoinerLimit) {
                accessibleIndex = i;
                break;
            }
        }

        // 입장 가능한 방 유무에 따른 동작
        if (this.roomList.get(accessibleIndex)!.size < this.setJoinerLimit) {
            this.roomList.get(accessibleIndex)!.add(socketId);
            enteredIndex = accessibleIndex;
        } else {
            // 새로운 방 생성/참가
            const newRoomIndex = this.roomList.size + 1;
            this.roomList.set(newRoomIndex, new Set([socketId]));
            enteredIndex = newRoomIndex;
        }
        joinerSize = this.roomList.get(enteredIndex)!.size;

        // 채팅방 참가 데이터 등록
        this.chatJoiner[socketId] = `${enteredIndex}`;

        // console.log('roomList : ', this.roomList);
        // console.log('chatJoiner : ', this.chatJoiner);

        return [enteredIndex, joinerSize, this.setJoinerLimit];
    }

    pvpJoinChat(socketId: string, pvpRoom: string): Array<number> {
        const roomName: Set<string> = this.pvpRoomList.get(pvpRoom)!

        if (!roomName) {
            this.pvpRoomList.set(pvpRoom, new Set())
        }
        this.pvpRoomList.get(pvpRoom)!.add(socketId)

        const joinerSize = this.pvpRoomList.get(pvpRoom)!.size;

        // 채팅방 참가 데이터 등록
        this.pvpChatJoiner[socketId] = `${pvpRoom}`;

        console.log('TEST pvpRoomList : ', this.pvpRoomList);
        console.log('TEST pvpChatJoiner : ', this.pvpChatJoiner);

        return [joinerSize, this.pvpSetJoinerLimit];
    }

    leaveChat(socketId: string): string {
        // tempData
        let joinerScript: string = '';

        // 참가중인 채팅방이 있다면 데이터 정리
        if (this.chatJoiner[socketId]) {
            const joinedRoom = Number(this.chatJoiner[socketId]);
            this.roomList.get(joinedRoom)!.delete(socketId);
            delete this.chatJoiner[socketId];
            // console.log(`채팅방 참여데이터 삭제 성공\n(${socketId} : ${joinedRoom})\n`);

            const joinerCnt: number = this.roomList.get(joinedRoom)!.size;

            if (joinerCnt === 0) this.roomList.delete(joinedRoom);

            joinerScript = `(${joinerCnt}/${this.setJoinerLimit})`;
        }

        return joinerScript;
    }

    pvpLeaveChat(socketId: string): string {
        // tempData
        let joinerScript: string = '';

        // 참가중인 채팅방이 있다면 데이터 정리
        if (this.pvpChatJoiner[socketId]) {
            const pvpRoom = this.pvpChatJoiner[socketId];
            this.pvpRoomList.get(pvpRoom)!.delete(socketId);
            delete this.pvpChatJoiner[socketId];
            // console.log(`채팅방 참여데이터 삭제 성공\n(${socketId} : ${pvpRoom})\n`);

            const joinerCnt: number = this.pvpRoomList.get(pvpRoom)!.size;

            if (joinerCnt === 0) this.pvpRoomList.delete(pvpRoom);

            joinerScript = `(${joinerCnt}/${this.pvpSetJoinerLimit})`;
        }

        return joinerScript;
    }

    getJoinedRoom(socketId: string): string {
        // console.log('socketId :', socketId);
        // console.log('chatJoiner : ', this.chatJoiner);
        return this.chatJoiner[socketId];
    }

    pvpGetJoinedRoom(socketId: string): string {
        // console.log('socketId :', socketId);
        // console.log('chatJoiner : ', this.chatJoiner);
        return this.pvpChatJoiner[socketId];
    }

    getAll = () => {
        const roomList = this.roomList;
        const chatJoiner = this.chatJoiner;

        return { roomList, chatJoiner };
    }
}

export default new ChatCache();
