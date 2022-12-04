import { CommandRouter } from "../../interfaces/socket"
import { pvpHelpScript, pvpScript } from "../../scripts"

export default {
    pvpHelp: (option: string): string => {
        const cmdRoute: CommandRouter = {
            pvpNpc: pvpHelpScript.pvpNpc,
            pvpList: pvpHelpScript.pvpList,
            pvpBattle: pvpHelpScript.pvpBattle,
            enemyChoice: pvpHelpScript.enemyChoice,
            attackChoice: pvpHelpScript.attackChoice,
        }
        return cmdRoute[option]
    }
}