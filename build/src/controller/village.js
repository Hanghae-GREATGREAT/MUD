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
    storyController: ({ line, user }) => __awaiter(void 0, void 0, void 0, function* () {
        const [CMD1, CMD2] = line.trim().split(' ');
        console.log('socketon battle');
        const commandRouter = {
            도움말: handler_1.npc.storyHelp,
            1: handler_1.npc.storyTalk,
            2: handler_1.npc.diary,
            3: handler_1.village.NpcList,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = handler_1.npc.storyWrongCommand(CMD1, user);
            return socket_routes_1.socket.emit('print', result);
        }
        const result = yield commandRouter[CMD1](CMD2, user);
        socket_routes_1.socket.emit('print', result);
    }),
    healController: ({ line, user }) => __awaiter(void 0, void 0, void 0, function* () {
        const [CMD1, CMD2] = line.trim().split(' ');
        console.log('socketon battle');
        const commandRouter = {
            도움말: handler_1.npc.healHelp,
            1: handler_1.npc.healTalk,
            2: handler_1.npc.heal,
            3: handler_1.village.NpcList,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = handler_1.npc.healWrongCommand(CMD1, user);
            return socket_routes_1.socket.emit('print', result);
        }
        const result = yield commandRouter[CMD1](CMD2, user);
        socket_routes_1.socket.emit('print', result);
    }),
    enhanceController: ({ line, user }) => __awaiter(void 0, void 0, void 0, function* () {
        const [CMD1, CMD2] = line.trim().split(' ');
        console.log('socketon battle');
        const commandRouter = {
            도움말: handler_1.npc.enhanceHelp,
            1: handler_1.npc.enhanceTalk,
            2: handler_1.npc.enhance,
            3: handler_1.village.NpcList,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = handler_1.npc.enhanceWrongCommand(CMD1, user);
            return socket_routes_1.socket.emit('print', result);
        }
        const result = yield commandRouter[CMD1](CMD2, user);
        socket_routes_1.socket.emit('print', result);
    }),
    gambleController: ({ line, user }) => __awaiter(void 0, void 0, void 0, function* () {
        const [CMD1, CMD2] = line.trim().split(' ');
        console.log('socketon battle');
        const commandRouter = {
            도움말: handler_1.npc.gambleHelp,
            1: handler_1.npc.gambleTalk,
            2: handler_1.npc.gamble,
            3: handler_1.village.NpcList,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = handler_1.npc.gambleWrongCommand(CMD1, user);
            return socket_routes_1.socket.emit('print', result);
        }
        const result = yield commandRouter[CMD1](CMD2, user);
        socket_routes_1.socket.emit('print', result);
    }),
};
