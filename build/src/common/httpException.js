"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(message, status) {
        super();
    }
}
exports.default = HttpException;
