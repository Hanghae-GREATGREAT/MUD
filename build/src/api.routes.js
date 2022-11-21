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
const cache_1 = require("./db/cache");
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    // const { attack, skill } = await CharacterService.findByPk(2);
    // const result = battle.skillSelector(skill);
    cache_1.battleCache.set(1111, { monsterId: 123 });
    console.log(cache_1.battleCache.get(1111));
    cache_1.battleCache.set(1111, { dungeonLevel: 1 });
    console.log(cache_1.battleCache.get(1111));
    res.status(200).json({
        message: 'API INDEX',
    });
}));
router.get('/battleCache', (req, res) => {
    const cache = cache_1.battleCache.getAll();
    console.log(cache);
    res.status(200).json({ cache });
});
exports.default = router;
