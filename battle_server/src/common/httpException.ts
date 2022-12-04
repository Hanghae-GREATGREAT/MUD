

class HttpException extends Error {
    declare message: string;
    declare status: number;
    declare socketId: string;
    
    constructor(message: string, status: number, socketId: string) {
        super();
    }
}

export default HttpException;