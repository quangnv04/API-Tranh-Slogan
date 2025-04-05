
    const API = {
        Users: {},
        Hosts: {}
    };

    // Users API
    (() => {
        API.Users.readAll = ({ limit = 200, page = 1 } = {}) => $.ajax({
            url: `/api/admin/users?limit=${limit}&page=${page}`,
            method: "GET",
        });

        API.Users.add = (data) => $.ajax({
            url: "/api/auth/register",
            method: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
        });
        
        API.Users.getById = (id) => $.ajax({
            url: `/api/admin/users/${id}`,
            method: "GET",
        });
        
        API.Users.update = (id, data) => $.ajax({
            url: `/api/admin/users/${id}`,
            method: "PUT",
            data: JSON.stringify(data),
            contentType: 'application/json',
        });
        
        API.Users.delete = (userId) => $.ajax({
            url: `/api/admin/users/${userId}/delete`,
            method: "PATCH",
            contentType: 'application/json',
        });
    })();

