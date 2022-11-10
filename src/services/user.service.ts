import bcrypt from 'bcrypt';
import { Users } from '../db/models';
import { HttpException, HttpStatus } from '../common';


class UserService {

    async signup({ username, password }: Partial<Users>) {
        const user = {
            username: username!,
            password: await bcrypt.hash(password!, 10),
        }
        return await Users.create(user);
    }

    async signin({ username, password }: Partial<Users>) {
        const user = await Users.findOne({
            where: { username }
        });
        if (!user) throw new HttpException('아이디가 일치하지 않습니다', HttpStatus.BAD_REQUEST);
        
        const result = await bcrypt.compare(password!, user!.password);
        if (!result) throw new HttpException('비밀번호가 일치하지 않습니다', HttpStatus.BAD_REQUEST);

        return user;
    }

    async dupCheck(username: string) {
        const user = await Users.findOne({ 
            where: { username }
         });

        return Boolean(user);
    }

    async signout(userId: number) {
        console.log('SIGNOUT')
    };
}


export default new UserService();