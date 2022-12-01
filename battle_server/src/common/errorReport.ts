

/**
 * 
 * @param error 
 * 
 * 에러 기록 (추후 수정 필요!!)
 * 
 */

import HttpException from "./httpException";

const errorReport = (error: Error) => {
    if (error instanceof HttpException) {
        console.log('HttpException', error.message)
        console.error(error);
    } else {
        console.log('ERROR: ', error.message);
        console.error(error);
    }
}

export default errorReport;