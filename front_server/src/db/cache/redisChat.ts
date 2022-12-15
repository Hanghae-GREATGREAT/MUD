import { createClient, RedisClientType, SetOptions } from 'redis';
import env from '../../env';



class RedisChat {
    private readonly client: RedisClientType;

    // private roomList: Map<number, Set<string>>;
    // // room number => socketId[]
    // private pvpRoomList: Map<string, Set<string>>;
    // // room name => socketId[]
    // private chatJoiner: ChatJoinerInterface = {};
    // private pvpChatJoiner: ChatJoinerInterface = {};
    // // 채팅방 입장 정원

    // `chat${roomId}` ... socketId[]
    // `pvp${roomId}` ... socketId[]

    // chatJoiner => { socketId: chatRoomId }
    // pvpJoiner => { socketId: pvpRoomId }


    private chatRoomCount = 0;
    private pvpRoomCount = 0;

    private chatRoomLimit = 10;
    private pvpRoomLimit = 10;

    constructor() {
        const { REDIS_URL } = env
        this.client = createClient({ url: REDIS_URL });
        this.connect();

        this.client.on('connect', () => {
            console.log('Redis connected');
        });

        this.client.on('error', (error) => {
            console.log('Redis error, service degraded: ', error);
        });
    }

    async joinChat(socketId: string): Promise<
    [chatId: number, chatSize: number, chatLimit: number]> {

        console.log('redisChat.joinChat()');
        // 입장 가능한 채팅방 탐색
        for (let i = 1; i <= this.chatRoomCount; i++) {
            const room = await this.getChatRoom(i);

            const joinerSize = room.length;
            if (joinerSize < this.chatRoomLimit) {

                this.joinChatRoom(i, socketId);
                this.addChatJoiner(socketId, i);
                return [i, joinerSize, this.chatRoomLimit];
            }
        }

        // 입장 가능한 방이 없을 경우
        const newChatRoomId = this.chatRoomCount + 1;
        this.createChatRoom(newChatRoomId, socketId);
        this.addChatJoiner(socketId, newChatRoomId);
        const joinerSize = 1;


        return [newChatRoomId, joinerSize, this.chatRoomLimit];
    }

    async joinPvp(socketId: string, pvpRoom: string): Promise<[chatSize: number, chatLimit: number]> {

        console.log('redisChat.joinPvp()');
        this.addPvpJoiner(socketId, pvpRoom);

        const room = await this.getPvpRoom(pvpRoom);
        console.log('joinPvp', room);
        if (!room) {
            console.log('create pvp chat', pvpRoom);
            this.createPvpRoom(pvpRoom, socketId);
            return [1, this.pvpRoomLimit];
        } else {
            console.log('join pvp chat', pvpRoom);
            this.joinPvpRoom(pvpRoom, socketId);
            return [room.length+1, this.pvpRoomLimit];
        }
    }

    async leaveChat(socketId: string) {
        console.log('redisChat.leaveChat()');
        const roomId = await this.findChatJoiner(socketId);

        if (roomId !== -1) {
            this.deleteChatJoiner(socketId);
            const chatSize = await this.leaveChatRoom(roomId, socketId);
            if (chatSize === 0) this.deleteChatRoom(roomId);

            const script = `(${chatSize}/${this.chatRoomLimit})`;
            return script;
        } else {
            return '';
        }
    }

    async leavePvp(socketId: string) {
        console.log('redisChat.leavePvp()');
        const roomName = await this.findPvpJoiner(socketId);

        if (roomName) {
            this.deletePvpJoiner(socketId);
            const pvpSize = await this.leavePvpRoom(roomName, socketId);
            if (pvpSize === 0) this.deletePvpRoom(roomName);

            const script = `(${pvpSize}/${this.pvpRoomLimit})`;
            return script;
        } else {
            return '';
        }
    }

    private createChatRoom(roomId: number, socketId: string) {
        console.log('redisChat.createChatRoom()');
        this.chatRoomCount++;

        const chatRoomName = `chat${roomId}`;
        this.client.set(chatRoomName, JSON.stringify([socketId]), { EX: 60*60*24 });
    }

    private async joinChatRoom(roomId: number, socketId: string) {
        console.log('redisChat.joinChatRoom()');
        const chatRoomName = `chat${roomId}`;
        const result = await this.client.get(chatRoomName) || '[]';
        const chatList: string[] = JSON.parse(result);

        const newList = [...chatList, socketId]
        this.client.set(chatRoomName, JSON.stringify(newList), { EX: 60*60*24 });
    }

    private async leaveChatRoom(roomId: number, socketId: string) {
        console.log('redisChat.leaveChatRoom()');
        const chatRoomName = `chat${roomId}`;
        const result = await this.client.get(chatRoomName) || '[]';
        const chatList: string[] = JSON.parse(result);

        const newList = chatList.filter(id => id !== socketId);
        this.client.set(chatRoomName, JSON.stringify(newList), { EX: 60*60*24 });

        return newList.length;
    }

    private async getChatRoom(roomId: number): Promise<string[]> {
        console.log('redisChat.getChatRoom()');
        const roomName = `chat${roomId}`;
        const result = await this.client.get(roomName) || '[]';

        return JSON.parse(result);
    }

    private deleteChatRoom(roomId: number) {
        console.log('redisChat.deleteChatRoom()');
        this.client.del(`chat${roomId}`);
    }

    private addChatJoiner(socketId: string, roomId: number) {
        console.log('redisChat.addChatJoiner()');
        this.client.hSet('chatJoiner', { [socketId]: roomId.toString() });
    }

    async findChatJoiner(socketId: string) {
        console.log('redisChat.findChatJoiner()');
        const roomId= await this.client.hGet('chatJoiner', socketId);
        return Number(roomId);
    }

    private deleteChatJoiner(socketId: string) {
        console.log('redisChat.deleteChatJoiner()');
        this.client.hDel('chatJoiner', socketId);
    }


    private createPvpRoom = (roomName: string, socketId: string) => {
        console.log('redisChat.createPvpRoom()');
        this.pvpRoomCount++;

        this.client.set(roomName, JSON.stringify([socketId]), { EX: 60*60*24 });
    }

    private joinPvpRoom = async (roomName: string, socketId: string) => {
        console.log('redisChat.joinPvpRoom()');
        const result = await this.client.get(roomName) || '[]';
        const pvpList: string[] = JSON.parse(result);

        const newList = [...pvpList, socketId]
        this.client.set(roomName, JSON.stringify(newList), { EX: 60*60*24 });
    }
    
    private async leavePvpRoom(roomName: string, socketId: string) {
        console.log('redisChat.leavlPvpRoom()');
        const result = await this.client.get(roomName) || '[]';
        const pvpList: string[] = JSON.parse(result);

        const newList = pvpList.filter(id => id !== socketId);
        this.client.set(roomName, JSON.stringify(newList), { EX: 60*60*24 });

        return newList.length;
    }
    
    private deletePvpRoom(roomName: string) {
        console.log('redisChat.deletePvpRoom()');
        this.client.del(roomName);
    }

    private async getPvpRoom(roomName: string): Promise<string[]|null> {
        console.log('redisChat.getPvpRoom()', roomName);
        const result = await this.client.get(roomName);
        return result ? JSON.parse(result) : null;
    }

    private addPvpJoiner(socketId: string, roomName: string) {
        console.log('redisChat.addPvpJoiner()');
        this.client.hSet('pvpJoiner', { [socketId]: roomName });
    }

    async findPvpJoiner(socketId: string) {
        console.log('redisChat.findPvpJoiner()');
        return await this.client.hGet('pvpJoiner', socketId);
    }
    
    private deletePvpJoiner(socketId: string) {
        console.log('redisChat.deletePvpJoiner()');
        this.client.hDel('pvpJoiner', socketId);
    }

    private async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.disconnect();
    }

    getClient() {
        return this.client;
    }
}

export default new RedisChat();