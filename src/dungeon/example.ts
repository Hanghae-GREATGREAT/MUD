import { UserSession } from "../interfaces/user"


export function example2Handler(CMD: string | undefined, user: UserSession) {
    console.log('dungeon examplehandler');

    const script = ''
    const field = ''
    return { script, user, field };
}