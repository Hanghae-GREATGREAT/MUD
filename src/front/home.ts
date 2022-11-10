import { UserSession } from "../interfaces/user";
import { UserService } from "../services";

export default {

    loadHome: (CMD: string | undefined, user: UserSession) => {
        console.log('LOAD HOME');
    
        const script = homeScript.loadHome;
        const field = 'front'
        return { script, user, field };
    },

    signout: (CMD: string | undefined, user: UserSession) => {
        console.log('SIGN OUT');
    
        UserService.signout(user.userId);
        const script = homeScript.signout;
        const field = 'signout'
        return { script, user, field };
    },

    emptyCommand: (CMD: string | undefined, user: UserSession) => {
        console.log('EMPTY COMMAND');
    
        const script = homeScript.wrongCommand;
        const field = 'front'
        return { script, user, field };
    },
}

const homeScript = {
    loadHome: `환영합니다.
    [HELP] 대괄호 안의 명령어를 사용할 수 있으며, 대소문자 구분을 하지 않아도 됩니다.
    이미 아이디가 있다면 [IN]을,
    회원가입을 해야한다면 [UP]을 입력해주세요. \n`,
    wrongCommand: `잘못 입력하였습니다. \n`,
    signout: `정상적으로 로그아웃하였습니다. \n`
}