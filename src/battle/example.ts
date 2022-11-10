import { UserSession } from "../interfaces/user"


export function example1Handler(CMD: string | undefined, user: UserSession) {
    console.log('battle examplehandler');

    const script = ''
    const field = ''
    return { script, user, field };
}
