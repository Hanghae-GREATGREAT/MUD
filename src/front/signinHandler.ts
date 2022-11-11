import { UserSession } from '../interfaces/user';
import { CharacterService, UserService, DungeonService } from '../services';
import { Characters } from '../db/models';
import redis from '../db/redis/config'

export default {

    signinUsername: (CMD: string | undefined, user: UserSession) => {
        const script = signinScript.username;
        const field = 'sign:20';
        
        return { script, user, field };
    },

    signinPassword: async(CMD: string | undefined, user: UserSession) => {
        user.username = CMD!;
        const script = signinScript.password;
        const field = 'sign:21'

        return { script, user, field };
    },

    signinCheck: async(CMD: string | undefined, user: UserSession, id: string) => {
        const username = user.username;
        const password = CMD;
        const result = await UserService.signin({ username, password });

        const userId = result?.userId || 0;
        const character = await CharacterService.findOneByUserId(userId);

        const userSession = {
            userId,
            characterId: character?.characterId,
        }
        await redis.hSet(id, userSession);

        if (character) {
            const characterSession = await Characters.getSessionData(character)
            user = Object.assign(user, characterSession);
        }
        const script = result ? signinScript.title: signinScript.incorrect;
        const field = result ? 'front' : 'sign:21';

        return { script, user, field };
    },


}

export const signinScript = {
    username: `\n======================로그인==========================
    아이디: \n`,
    password: `비밀번호: \n`,
    incorrect: `아이디 혹은 비밀번호가 일치하지 않습니다.
    비밀번호: \n`,
    title: `\n로그인 완료!!\n\n
    던전으로 가려면 [D]ungeon을,
    마을로 가려면 [V]illage를,
    접속을 종료하려면 [OUT]을 입력해주세요.\n`,
}

