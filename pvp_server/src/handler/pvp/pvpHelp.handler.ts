import { pvpHelpScript } from "../../scripts"

interface CommandRouter {
    [key: string]: string;
}

export default {
    pvpHelp: (option: string): string => {
        const cmdRoute: CommandRouter = {
            pvpNpc: pvpHelpScript.pvpNpc,
            pvpList: pvpHelpScript.pvpList,
            pvpJoin: pvpHelpScript.pvpJoin,
            pvpBattle: pvpHelpScript.pvpBattle,
        }
        return cmdRoute[option]
    }
}