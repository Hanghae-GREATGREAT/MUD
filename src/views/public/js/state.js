


class State{

    #state = undefined;
    constructor(initialState=undefined) {
        this.#state = initialState;

    }
    
    set = (updateState) => {
        console.log('update: ', updateState)
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
    
        const statusHTML = `
        <div class="infoName">
            <span>${status.name} / Lv. ${status.level}</span><span class="exp">경험치: ${status.exp}</span>
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