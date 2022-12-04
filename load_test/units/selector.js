

module.exports = ({ front, battle, village }) => {
    return {
        'none': [],
        'front': [front.toDungeon, front.toVillage],
        'sign': [front.signin, front.signup], // 실제 시작은 front. 매개변수가 달라서 구분
        'out': [front.signout, front.globalSignout],  // 마찬가지로 특수목적.
        'delete': front.delete,
        'global': [front.toHome, front.globalHelp],

        'dungeon': [
            battle.autoFromList, battle.dungeonList, battle.dungeonHelp, battle.dungeonWrong],
        'encounter': [],
        'action': [],
        'battle': [battle.auto],
        'autoBattle': [],
        'adventureResult': [],

        'village': [
            village.help, village.toStory, village.toHeal, village.toEnhance, 
            village.toGamble, village.toPvp, front.toHome, front.globalHelp],
        'story': [village.talk, village.return, village.help, village.story],
        'heal': [village.talk, village.return, village.help, village.heal],
        'enhance': [village.talk, village.return, village.help, village.enhance],
        'gamble': [village.talk, village.return, village.help, village.gamble],

        'pvp': [],
    }
}