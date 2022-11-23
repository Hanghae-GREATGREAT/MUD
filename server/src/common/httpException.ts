

class HttpException extends Error {
    declare message: string;
    declare status: number;
    
    constructor(message: string, status: number) {
        super();
    }
}

export default HttpException;