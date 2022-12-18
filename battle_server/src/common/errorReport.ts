

/**
 * 
 * @param error 
 * 
 * 에러 기록 (추후 수정 필요!!)
 * 
 */

import BATTLE from "../redis";
import HttpException from "./httpException";

const errorReport = (error: Error) => {
    if (error instanceof HttpException) {
        const result = {
            field: 'dungeon',
            script: `
            시스템 오류로 던전 목록으로 돌아갑니다.\n`,
        };
        BATTLE.to(error.socketId).emit('print', result);
        // //console.log('HttpException', error.message);
        // console.error(error);
    } else {
        // //console.log('ERROR: ', error.message);
        // console.error(error);
    }
}

export default errorReport;