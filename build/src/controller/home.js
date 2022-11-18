"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_routes_1 = require("../socket.routes");
const handler_1 = require("../handler");
exports.default = {
    noneController: ({ line, user }) => {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');
        const commandRouter = {
            'LOAD': handler_1.front.loadHome
        };
        const result = commandRouter[CMD1](CMD2, user);
        socket_routes_1.socket.emit('print', result);
        socket_routes_1.socket.emit('enterChat', 'none');
    },
    frontController: ({ line, user }) => __awaiter(void 0, void 0, void 0, function* () {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');
        console.log('front', CMD1, CMD2);
        const commandRouter = {
            IN: handler_1.front.signinUsername,
            UP: handler_1.front.signupUsername,
            OUT: handler_1.front.signout,
            D: handler_1.front.toDungeon,
            DUNGEON: handler_1.front.toDungeon,
            V: handler_1.front.toVillage,
            VILLAGE: handler_1.front.toVillage,
            DELETE: handler_1.front.deleteAccount,
            EMPTY: handler_1.front.emptyCommand,
        };
        if (!commandRouter[CMD1]) {
            const result = commandRouter['EMPTY'](line, user);
            return socket_routes_1.socket.emit('print', result);
        }
        const result = yield commandRouter[CMD1](CMD2, user, socket_routes_1.socket.id);
        if (result.chat)
            socket_routes_1.socket.emit('enterChat', result.field);
        if (result.field === 'signout') {
            socket_routes_1.socket.emit('signout', result);
        }
        else {
            socket_routes_1.socket.emit('print', result);
        }
    }),
    signController: ({ line, user, option }) => __awaiter(void 0, void 0, void 0, function* () {
        const [CMD1, CMD2] = line.trim().split(' ');
        const commandRouter = {
            10: handler_1.front.signupPassword,
            11: handler_1.front.createUser,
            12: handler_1.front.createCharacter,
            20: handler_1.front.signinPassword,
            21: handler_1.front.signinCheck,
            EMPTY: handler_1.front.emptyCommand,
        };
        if (!CMD1 || !option) {
            const result = commandRouter['EMPTY'](line, user);
            return socket_routes_1.socket.emit('print', result);
        }
        const result = yield commandRouter[option](CMD1, user, socket_routes_1.socket.id);
        if (result.chat)
            socket_routes_1.socket.emit('enterChat', result.field);
        socket_routes_1.socket.emit('print', result);
    })
};
