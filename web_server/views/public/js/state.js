


class State{

    #state = undefined;
    constructor(initialState=undefined) {
        this.#state = initialState;

    }
    
    set = (updateState) => {
        this.#state = updateState
        this.#render();
    }

    get = () => {
        return this.#state;
    }

    #render = () => {
        const status = this.#state;
        const userInfo = $('#userInfo');
        userInfo.empty();
    
        if (JSON.stringify(status) === '{}' || !status) {
            const statusHTML = `
                <div class="infoName">
                    <span>로그인을 해주세요</span>
                </div>
                `;
            userInfo.append(statusHTML);
            return;
        }
        const weapon = status.item.split(':')[0];
        const statusHTML = `
        <div class="infoName">
            <span>${status.name}<a class="level">/ Lv. ${status.level}</a></span>
            <div class="infoExp">
                <span class="weapon">무기레벨: ${weapon}</span>
                <span class="exp">경험치: ${status.exp}</span>
            </div>
        </div>
        <div class="infoSub">
            <div class="infoUser"><span>${status.username}</span></div>
            <div class="infoStatus">
                <span>체력: ${status.maxhp}/${status.hp}</span>
                <span>마나: ${status.maxmp}/${status.mp}</span>
            </div>
        </div>
        `;
        userInfo.append(statusHTML);
        return;
    };
}


class Server {
    #PORT = 3333;
    #URL = 'localhost'

    getServerUrl = () => {
        return `${this.#URL}:${this.#PORT}`;
    }
}
const SERVER = new Server();