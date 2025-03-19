$(document).ready(function () {
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${value || ""}${expires}; path=/; Secure; SameSite=Strict`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    $('#login-form').on('submit', function (event) {
        event.preventDefault();
        const username = $('#username').val().trim();
        const password = $('#password').val().trim();

        $.ajax({
            url: '/api/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function (response) {
                // setCookie('access_token', response.access_token, 1); // Store token without 'Bearer ' prefix
                // setCookie('refresh_token', response.refresh_token, 7);
                console.log("Login successful:", response.message);
                window.location.href = '/admin';
            },
            error: function (xhr) {
                let errorMessage = xhr.responseJSON?.detail || 'Đăng nhập thất bại. Vui lòng thử lại.';
                if (xhr.status === 401 && xhr.responseJSON?.detail === 'Token expired') {
                    errorMessage = 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.';
                }
                $('#error-message').text(errorMessage).show();
            }
        });
    });
});