import BATTLE from "../redis";
import { dungeonScript } from "../scripts";


const battleError = (socketId: string) => {
    const error = '\n<span stype="color:red">[!!]</span>전투 중 문제가 발생하여 입구로 돌아갑니다.\n\n'
    const script = dungeonScript.entrance;
    const data = { field: 'dungeon', script: error+script };
    BATTLE.to(socketId).emit('print', data);
    return;
}

export default battleError;