interface ChatJoinerInterface {
    [key: string]: string;
}

class ChatCache {
    private roomList: Map<number, Set<string>>;
    private chatJoiner: ChatJoinerInterface = {};
    // 채팅방 입장 정원
    private setJoinerLimit: number = 5;

    constructor() {
        this.roomList = new Map();
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
            console.log('roomList : ', this.roomList);
            console.log('chatJoiner : ', this.chatJoiner);

            return [accessibleIndex, joinerSize, this.setJoinerLimit];
        }

        // 입장 가능한 채팅방 탐색
        for (let i = 1; i <= this.roomList.size; i++) {
            joinerSize = this.roomList.get(i)!.size;
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

        console.log('roomList : ', this.roomList);
        console.log('chatJoiner : ', this.chatJoiner);

        return [enteredIndex, joinerSize, this.setJoinerLimit];
    }

    leaveChat(socketId: string): string {
        // tempData
        let joinerScript: string = '';

        // 참가중인 채팅방이 있다면 데이터 정리
        if (this.chatJoiner[socketId]) {
            const joinedRoom = Number(this.chatJoiner[socketId]);
            this.roomList.get(joinedRoom)!.delete(socketId);
            delete this.chatJoiner[socketId];
            console.log(`채팅방 참여데이터 삭제 성공\n(${socketId} : ${joinedRoom})\n`);

            const joinerCnt: number = this.roomList.get(joinedRoom)!.size;

            if (joinerCnt === 0) this.roomList.delete(joinedRoom);

            joinerScript = `(${joinerCnt}/${this.setJoinerLimit})`;
        }

        return joinerScript;
    }

    getJoinedRoom(socketId: string): string {
        console.log('socketId :', socketId);
        console.log('chatJoiner : ', this.chatJoiner);
        return this.chatJoiner[socketId];
    }
}

export default new ChatCache();
