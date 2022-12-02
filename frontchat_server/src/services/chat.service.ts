// import { roomList } from '../handler/front/home.handler';

// class chatService {
//     /** */
//     enterChat(socketId: string) {
//         // 입장 정원 설정
//         const setLimit = 2;

//         let accessibleRoom = 1;
//         let enterIndex: number;

//         // 아무도 없다면 방 생성
//         if (roomList.size === 0) {
//             const roomId = roomList.size + 1;
//             roomList.set(roomId, new Set([socketId]));
//             return [roomId, setLimit];
//         }

//         // 입장 가능한 방 탐색
//         for (let i = 1; i <= roomList.size; i++) {
//             if (roomList.get(i)!.size < setLimit) {
//                 accessibleRoom = i;
//                 break;
//             }
//         }

//         // 가능한 방이 있다면 해당 방에 추가, 없다면 새로운 방 생성
//         if (roomList.get(accessibleRoom)!.size < setLimit) {
//             console.log('기존 방에 입장', accessibleRoom);
//             enterIndex = accessibleRoom;
//             roomList.get(accessibleRoom)!.add(socketId);
//         } else {
//             console.log('새로운 방 생성', accessibleRoom);
//             const roomId = roomList.size + 1;
//             roomList.set(roomId, new Set([socketId]));
//             enterIndex = roomId;
//         }
//         return [enterIndex, setLimit];
//     }
// }

// export default new chatService();
