import fetch, { Response } from 'node-fetch';
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

const fetchPost = (params: PostParams): Promise<Response> => {
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
            //console.log(`[${new Date(Date.now()+1000*60*60*9)}]`, response.status, response.url, userInfo?.characterId);
            resolve(response);
        }).catch((error) => {
            errorReport(error);

            const URI = URL.split(':')[URL.split(':').length-1]
            const localURL = `http://localhost:${URI}`;
            //console.log('RESENDING REQUEST', userInfo?.characterId, URI)
            fetch(localURL, { 
                method: 'post', 
                headers,
                body: JSON.stringify(body),
            }).then((response) => {
                //console.log(`[${new Date(Date.now()+1000*60*60*9)}]`, response.status, response.url, userInfo?.characterId);
                resolve(response);
            }).catch(errorReport);
        });
    });
}


export default fetchPost;