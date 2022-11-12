

class BattleService {
    
    hitStrength(damage: number): number {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        return Math.floor((damage * hitStrength) / 100);
    }

    dmageAdjective(hit: number, damage: number): string {
        // 공격력의 몇 %에 해당하는 공격인가?
        const damageRatio = Math.floor((hit / damage) * 100);

        const weekAdjective: string[] = ['어설픈', '약한', '힘 없는'];
        const nomalAdjective: string[] = ['일반적인', '적절한', '평범한'];
        const strongAdjective: string[] = ['강한', '효과적인', '강력한'];

        let resultAdjective: string = '';

        if (damageRatio < 95) {
            // week
            const num = weekAdjective.length;
            resultAdjective = weekAdjective[this.randomPicker(num)];
        } else if (damageRatio < 105) {
            // nomal
            const num = nomalAdjective.length;
            resultAdjective = nomalAdjective[this.randomPicker(num)];
        } else {
            // strong
            const num = strongAdjective.length;
            resultAdjective = strongAdjective[this.randomPicker(num)];
        }

        return resultAdjective;
    }

    randomPicker(length: number) {
        return Math.floor(Math.random() * length);
    }
}

export default new BattleService();
