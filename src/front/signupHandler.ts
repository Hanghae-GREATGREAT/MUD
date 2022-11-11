import { SignupForm, UserSession } from "../interfaces/user"
import redis from '../db/redis/config';
import { CharacterService, UserService } from "../services";
import { Characters } from "../db/models";


export default {

    signupUsername: (CMD: string | undefined, user: UserSession) => {
        const script = signupScript.username;
        const field = 'sign:10';
        return { script, user, field };
    },

    signupPassword: async(CMD: string | undefined, user: UserSession, id: string) => {
        const username = CMD!;
        const result = await UserService.dupCheck(username);

        user.username = username;
        const script = !result ? signupScript.password : signupScript.dupUser;
        const field = !result ? 'sign:11' : 'sign:10';

        return { script, user, field };
    },

    createUser: async (CMD: string | undefined, user: UserSession, id: string) => {
        console.log('CREATE USER');
        const userCreated = await UserService.signup({ username: user.username, password: CMD });
        
        user.userId = userCreated.getDataValue('userId');    
        const script = signupScript.create;
        const field = 'sign:12';
        return { script, user, field };
    },

    createCharacter: async (CMD: string | undefined, user: UserSession, id: string) => {
        console.log('CREATE CHARACTER');
        const name = CMD!;
        const userId = user.userId;
        const character = await CharacterService.createNewCharacter({ name, userId });

        const userSession = {
            userId,
            characterId: character?.characterId,
        }
        await redis.hSet(id, userSession);

        user = Object.assign(user, Characters.getSessionData(character));
        const script = signupScript.title;
        const field = 'front';
        return { script, user, field };
    },

}


export const signupScript = {
    username: `\n======================회원가입==========================
    사용하실 아이디를 입력해주세요: \n`,
    password: `사용하실 비밀번호를 입력해주세요: \n`,
    create: `플레이할 캐릭터의 이름을 입력해주세요: \n`,
    title: `\n\n 캐릭터 생성 완료!\n.
    던전으로 가려면 [D]ungeon을,
    마을로 가려면 [V]illage를,
    접속을 종료하려면 [OUT]을 입력해주세요.\n`,
    dupUser: `이미 존재하는 아이디입니다.
    사용하실 아이디를 입력해주세요: \n`,
    dupName: `이미 존재하는 이름입니다.
    플레이할 캐릭터의 이름을 입력해주세요: \n`,
}