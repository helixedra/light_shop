// LOGIN

// Validation

// Validation name
function validateName(inputPrefix, name = null) {
    if (name !== null) {
        if (name !== '') {
            if (name.length < 2 || /\d+/.test(name)) {
                showError(inputPrefix + 'Name', 'Введите корректное имя')
                return false
            } else {
                hideError(inputPrefix + 'Name')
            }
        } else {
            showError(inputPrefix + 'Name', 'Введите ваше имя')
            return false
        }
    } else {
        return false
    }
    return true
}

// Validation phone
function validatePhone(inputPrefix, phone = null) {
    if (phone !== null) {
        if (phone !== '') {
            if (phone.length < 9 || phone.length > 20 || !/^[\d+()+\s+-]+$/g.test(phone)) {
                showError(inputPrefix + 'Phone', 'Введите корректный номер')
                return false
            } else {
                hideError(inputPrefix + 'Phone')
            }
        } else {
            showError(inputPrefix + 'Phone', 'Введите ваш номер телефона')
            return false
        }
    } else {
        return false
    }
    return true
}


// Validate email
function validateEmail(inputPrefix, email = null) {
    if (email !== null) {
        if (email !== '') {
            if (email.length < 4 || !/(.+)@(.+){2,}\.(.+){2,}/.test(email) || email.length > 50) {
                showError(inputPrefix + 'Email', 'Введите корректный e-mail')
                return false
            } else {
                hideError(inputPrefix + 'Email')
            }
        } else {
            showError(inputPrefix + 'Email', 'Введите ваше e-mail')
            return false
        }
    } else {
        return false
    }
    return true
}

// Validate password
function validatePassword(inputPrefix, password = null) {
    if (password !== null) {
        if (password !== '') {
            if (!/[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]/g.test(password) || password.length < 3) {
                showError(inputPrefix + 'Password', 'Введите корректный пароль. Только латинские буквы, цыфры и специальные символы. Не меньше 3 символов.')
                return false
            } else {
                hideError(inputPrefix + 'Password')
            }
        } else {
            showError(inputPrefix + 'Password', 'Введите пароль')
            return false
        }
    } else {
        return false
    }
    return true
}

// $('input[name=email]').on('change paste keyup', function () {
//     validate()
// })
// $('input[name=password]').on('change paste keyup', function () {
//     validate()
// })

function showError(input, error) {
    if ($('#' + input + 'Error').length === 0) {
        $('#' + input).addClass('input-error').after("<div class='error-msg' id='" + input + "Error'>" + error + "</div>")
    } else {
        $('#' + input + 'Error').html(error)
    }
}

function hideError(input) {
    $('#' + input + 'Error').remove()
    $('#' + input).removeClass('input-error')
}

$(document).ready(function () {

    isLoginCheckout()
    $("#closeCheckout").click(function () {
        event.preventDefault();
        history.back(1);
    });

})

//Check if login on checkout page
function isLoginCheckout() {
    if (+$('input[name=client_id]').val() === 0) {
        // console.log('not logged');
        $('.sub-login-box').addClass('visible')
    } else {
        // console.log('logged');
        $('.sub-login-box').removeClass('visible').addClass('invisible')
    }
}

// LOGIN
$("button#loginSubmit").click(function (e) {
    e.preventDefault();
    // Return validation status true||false
    let vEmail = validateEmail('login', $('#loginEmail').val()),
        vPassword = validatePassword('login', $('#loginPassword').val())

    if (vEmail && vPassword) {
        login($('form#loginForm'))
    }
});

function login(data) {
    $.ajax({
        url: "/user/login",
        type: "POST",
        data: data.serialize(),
        success: function (result) {
            if (result) {
                if (result.status === 'success') {
                    statusLogin()
                    $(function () {
                        $('#loginModal').modal('toggle');
                    })
                    $('.login-msg-success').html('😀 ' + result.message)
                    $('#loginSuccess').fadeIn(400)
                    fadeError()
                } else {
                    $('.login-msg').html(result.message)
                    $('#loginError').fadeIn(400)
                    fadeError()
                }
            }
        }
    })
}

function statusLogin() {
    $.get('/user/login', { auth: 'status' }, function (res) {
        if (res.status) {
            $('#user-menu').show()
            $('#user-name').text(res.name.name)
            $('#guest-menu').hide()
        } else {
            $('#user-menu').hide()
            $('#user-name').text('')
            $('#guest-menu').show()
        }
    })
}

function fadeError() {

    if (isCheckout()) {
        setTimeout(() => {
            location.reload();
        }, 2000)
    }

    setTimeout(() => {
        $('.alert').fadeOut(800);

    }, 4000)
}




$('.pass-eye').on('click', function () {
    let input = $(this).attr('data-eye')
    let inputAttr = $('input[data-eye="' + input + '"]').attr('type')
    if (inputAttr === 'password') {
        $('input[data-eye="' + input + '"]').attr('type', 'text')
        $(this).html('<i class="far fa-eye"></i>')
    } else {
        $('input[data-eye="' + input + '"]').attr('type', 'password')
        $(this).html('<i class="far fa-eye-slash"></i>')
    }
})

// Registration
$("input#regSubmit").click(function (e) {
    e.preventDefault();

    // Return validation status true||false
    let vName = validateName('reg', $('#regName').val()),
        vPhone = validatePhone('reg', $('#regPhone').val()),
        vEmail = validateEmail('reg', $('#regEmail').val()),
        vPassword = validatePassword('reg', $('#regPassword').val())

    if (vName && vPhone && vEmail && vPassword) {
        registration($('form#registrationForm'))
    }

})

function registration(data) {
    $.ajax({
        url: "/user/registration",
        type: 'POST',
        data: data.serialize(),
        success: function (result) {
            if (result) {
                if (result.status === 'success') {
                    $(function () {
                        $('#loginModal').modal('toggle');
                    })
                    $('.login-msg-success').html(result.message)
                    $('#loginSuccess').show()
                    fadeError()
                } else {
                    $('.registration-msg').html(result.message)
                    $('#registrationError').show()
                    fadeError()
                }
            }
        }
    })
}