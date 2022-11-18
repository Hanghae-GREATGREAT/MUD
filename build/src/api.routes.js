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
const express_1 = require("express");
const router = (0, express_1.Router)();
const services_1 = require("./services");
const handler_1 = require("./handler");
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    const { attack, skill } = yield services_1.CharacterService.findByPk(2);
    const result = handler_1.battle.skillSelector(skill);
    res.status(200).json({
        message: 'API INDEX',
        result,
    });
}));
exports.default = router;
