const signupToggleHandler = () => {
    $('#signinSubmit').addClass('is-hidden');
    $('#signupToggle').addClass('is-hidden');
    
    $('#signupSubmit').removeClass('is-hidden');
    $('#signinToggle').removeClass('is-hidden'); 
    
    $('#confirm').removeClass('is-hidden');
}

const signinToggleHandler = () => {
    $('#signinSubmit').removeClass('is-hidden');
    $('#signupToggle').removeClass('is-hidden');
    
    $('#signupSubmit').addClass('is-hidden');
    $('#signinToggle').addClass('is-hidden');
    
    $('#confirm').addClass('is-hidden');
}

const signinSubmitHandler = async() => {
    const inputname = $('#inputName').val();
    const password = $('#inputPass').val();

    const response = await fetch('/user/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: inputname, password, confirm })
    });

    const { user } = await response.json();
    localStorage.setItem('user', JSON.stringify(user));

    location.replace('/');
};

const signupSubmitHandler = async() => {
    const username = $('#inputName').val();
    const password = $('#inputPass').val();
    const confirm = $('#inputConfirm').val();

    fetch('/user/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, confirm })
    });

    signinToggleHandler();
    $('#inputName').val('');
    $('#inputPass').val('');
    $('#inputConfirm').val('');
};