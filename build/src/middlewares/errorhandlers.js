"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class ErrorHandler {
    logger(error, req, res, next) {
        console.error(error);
        next(error);
    }
    ;
    handler(error, req, res, next) {
        if (error instanceof common_1.HttpException) {
            const status = error.status || 400;
            res.status(status).json({
                message: error.message
            });
        }
        else {
            res.status(500).json({
                message: error.message
            });
        }
    }
    ;
}
exports.default = new ErrorHandler();
