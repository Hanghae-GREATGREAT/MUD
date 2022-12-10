

module.exports = ({ front, battle, village, pvp }) => {
    return {
        'none': [],
        'front': [front.toDungeon, front.toDungeon, front.toVillage],
        'sign': [front.signin, front.signup], // 실제 시작은 front. 매개변수가 달라서 구분
        'out': [front.signout, front.globalSignout],  // 마찬가지로 특수목적.
        'delete': front.delete,
        'global': [front.toHome, front.globalHelp],

        'dungeon': [
            battle.autoFromList, battle.autoFromList, battle.dungeonList,
            battle.dungeonHelp, battle.dungeonWrong],
        'encounter': [],
        'action': [],
        'battle': [battle.auto],
        'autoBattle': [],
        'adventureResult': [],

        'village': [
            village.help, village.toStory, village.toHeal, village.toEnhance, 
            village.toGamble, front.toHome, front.toHome, front.globalHelp,
            // village.toPvp, village.toPvp
        ],
        'story': [
            village.talk, village.return, village.help, 
            village.story, village.story, front.toHome,
        ],
        'heal': [
            village.talk, village.return, village.help,
            village.heal, village.heal, front.toHome,
        ],
        'enhance': [
            village.talk, village.return, village.help,
            village.enhance, village.enhance, front.toHome,
        ],
        'gamble': [
            village.talk, village.return, village.help,
            village.gamble, village.gamble, front.toHome,
        ],

        'pvp': [],
        'pvpNpc': [
            pvp.npcHelp, pvp.npcTalk, pvp.pvpEnter, pvp.pvpEnter,
            pvp.npcReturn, pvp.npcWrong,
        ],
        'pvpList': [
            pvp.listHelp, pvp.listRefresh, pvp.listRefresh, pvp.listReturn,
            pvp.roomCreate, pvp.roomCreate, pvp.roomJoin, pvp.roomJoin,
            pvp.listWrong,
        ],
        'pvpJoin': [
            pvp.joinHelp, pvp.joinWrong, pvp.joinReturn, pvp.joinRefresh,
        ],
        'pvpBattle': [
            pvp.battleHelp, pvp.battleWrong, pvp.battleStatus, pvp.battleAttack,
            pvp.battleAttack, pvp.battleAttack, pvp.battleAttack, pvp.battleAttack,
        ],
    }
}