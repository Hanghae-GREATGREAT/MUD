


const rooms = new Map();

rooms.set('user1', 4);
rooms.set('user2', 4);
rooms.set('user3', 3);
rooms.set('user4', 4);

const roomList = rooms.entries();
let roomId = -1;
let line = '';
for (const room of roomList) {
    if (room[1] < 4) {
        roomId = room[0];
        rooms.set(roomId, ++room[1]);
        line = `2 ${roomId}`;
        break;
    }
}
if (roomId === -1) {
    roomId = userInfo.characterId;
    rooms.set(roomId, 1);
    line = `1 ${roomId}`;
}

console.log('done', roomId);
console.log(rooms);