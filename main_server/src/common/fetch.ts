import fetch from 'node-fetch';
import errorReport from './errorReport';
import { UserInfo, UserStatus } from '../interfaces/user';


interface PostParams {
    URL: string;
    socketId: string;
    CMD?: string;
    userInfo?: UserInfo;
    userStatus?: UserStatus;
    option?: string;
}

const fetchPost = (params: PostParams): Promise<unknown> => {
    const { URL, socketId, CMD, userInfo, userStatus, option } = params;

    const headers = { 
        'Content-Type': 'application/json'
    }
    const body = {
        socketId, CMD, userInfo, userStatus, option
    }

    return new Promise((resolve, reject) => {
        fetch(URL, { 
            method: 'post', 
            headers,
            body: JSON.stringify(body),
        }).then((response) => {
            console.log(response.status, response.url)
            resolve(response);
        }).catch((error) => {
            errorReport(error);

            const URI = URL.split(':')[-1]
            const localURL = `http://localhost${URI}`;
            fetch(localURL, { 
                method: 'post', 
                headers,
                body: JSON.stringify(body),
            }).then((response) => {
                console.log(response.status, response.url);
                resolve(response);
            }).catch(errorReport);
        });
    });
}


export default fetchPost;