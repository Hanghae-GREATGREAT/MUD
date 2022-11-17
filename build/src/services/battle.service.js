"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BattleService {
    hitStrength(damage) {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        return Math.floor((damage * hitStrength) / 100);
    }
    dmageAdjective(hit, damage) {
        // 공격력의 몇 %에 해당하는 공격인가?
        const damageRatio = Math.floor((hit / damage) * 100);
        const weekAdjective = ['어설픈', '약한', '힘 없는'];
        const nomalAdjective = ['일반적인', '적절한', '평범한'];
        const strongAdjective = ['강한', '효과적인', '강력한'];
        let resultAdjective = '';
        if (damageRatio < 95) {
            // week
            const num = weekAdjective.length;
            resultAdjective = weekAdjective[this.randomPicker(num)];
        }
        else if (damageRatio < 105) {
            // nomal
            const num = nomalAdjective.length;
            resultAdjective = nomalAdjective[this.randomPicker(num)];
        }
        else {
            // strong
            const num = strongAdjective.length;
            resultAdjective = strongAdjective[this.randomPicker(num)];
        }
        return resultAdjective;
    }
    randomPicker(length) {
        return Math.floor(Math.random() * length);
    }
}
exports.default = new BattleService();
