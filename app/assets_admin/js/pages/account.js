$(document).ready(function () {
    $.ajax({
        url: '/api/admin/accounts',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const tbody = $('#datatable-search tbody');
            tbody.empty();

            data.forEach(a => {
                const accountHtml = `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="customCheck${a.id}">
                                </div>
                                <p class="text-xs font-weight-bold ms-2 mb-0">${a.id}</p>
                            </div>
                        </td>
                        <td class="text-xs font-weight-bold table-cell">${a.username}</td>
                        <td class="text-xs font-weight-bold table-cell">${a.phone}</td>
                        <td class="text-xs font-weight-bold table-cell">${a.email}</td>
                        <td class="text-xs font-weight-bold table-cell">${a.updated_at}</td>
                        <td>
                            <div class="form-check form-switch">
                                <input class="form-check-input toggle-status-switch" type="checkbox" role="switch" data-id="${a.id}" ${a.status === 'active' ? 'checked' : ''}>
                            </div>
                        </td>
                        <td class="text-sm">
                            <a href="javascript:;" class="toggle-details" data-id="${a.id}" data-bs-toggle="modal" data-bs-target="#accountDetailModal">
                                <i class="fas fa-eye text-secondary"></i>
                            </a>
                            <a href="javascript:;" class="mx-3 edit-btn" data-id="${a.id}" data-bs-toggle="modal" data-bs-target="#accountModal">
                                <i class="fas fa-user-edit text-secondary"></i>
                            </a>
                        </td>
                    </tr>
                `;
                tbody.append(accountHtml);
            });

            let table = new simpleDatatables.DataTable("#datatable-search", {
                searchable: true,
                fixedHeight: false
            });

            $('.table-cell').each(function () {
                if (this.scrollWidth > this.clientWidth) {
                    $(this).attr('data-bs-toggle', 'popover');
                    $(this).popover({
                        trigger: 'click',
                        placement: 'top',
                        content: $(this).text(),
                        html: false
                    });
                }
            });
        },
        error: function (error) {
            console.error("Error fetching accounts:", error);
        }
    });

    $('#datatable-search tbody').on('change', '.toggle-status-switch', async function () {
        const checkbox = $(this);
        const id = checkbox.data('id');
        const newStatus = checkbox.is(':checked') ? 'active' : 'inactive';

        try {
            const response = await fetch(`/api/admin/account/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            if (!response.ok) {
                alert(result.detail);
                checkbox.prop('checked', !checkbox.is(':checked'));
            }
        } catch (err) {
            alert(err.message);
            checkbox.prop('checked', !checkbox.is(':checked'));
        }
    });

});

$(document).on('click', '.toggle-details', async function () {
    const id = $(this).data('id');

    try {
        const response = await fetch(`/api/admin/account/${id}`);
        const data = await response.json();
        if (!response.ok) {
            return alert(data.detail);
        }

        $('#detail-id').text('Account #' + data.id);
        $('#detail-username').text(data.username);
        $('#detail-password-hash').text(data.password_hash);
        $('#detail-phone').text(data.phone);
        $('#detail-email').text(data.email);
        $('#detail-notes').text(data.notes);
        $('#detail-status').text(data.status);
        $('#detail-created-at').text(data.created_at);
        $('#detail-updated-at').text(data.updated_at);
    } catch (err) {
        alert(err.message);
    }
});

$('#create-btn').on('click', async function () {
    $('#input-username').val("");
    $('#input-phone').val("");
    $('#input-email').val("");
    $('#input-notes').val("");
    $('#status-switch').prop('checked');

    $('#account-modal-title').text("New Account");
    $('#account-modal-description').text("Enter information to create a new account");
    $('#save-btn').text("Create");

    $('#save-btn').off('click').on('click', createAccount);
});

$('#datatable-search tbody').on('click', '.edit-btn', async function () {
    const id = $(this).data('id');

    try {
        const response = await fetch(`/api/admin/account/${id}`);
        if (!response.ok) throw new Error("Failed to fetch account data");

        const account = await response.json();

        $('#input-username').val(account.username);
        $('#input-phone').val(account.phone);
        $('#input-email').val(account.email);
        $('#input-notes').val(account.notes);
        $('#status-switch').prop('checked', account.status == 'active');

        $('#account-modal-title').text("Update Account");
        $('#account-modal-description').text("Enter information to update account");
        $('#save-btn').text("Update");

        $('#save-btn').off('click').on('click', () => updateAccount(id));
    } catch (error) {
        alert(error.message);
    }
});

async function createAccount() {
    const username = document.getElementById('input-username').value.trim();
    const password = document.getElementById('input-password').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const notes = document.getElementById('input-notes').value.trim();
    const status = document.getElementById('status-switch').checked ? 'active' : 'inactive';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                phone: phone,
                email: email,
                notes: notes,
                status: status
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Account created successfully!");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (error) {
        alert(error.message);
    }
}

async function updateAccount(id) {
    const username = document.getElementById('input-username').value.trim();
    const password = document.getElementById('input-password').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const notes = document.getElementById('input-notes').value.trim();
    const status = document.getElementById('status-switch').checked ? 'active' : 'inactive';

    if (!username || !email || !phone) {
        return alert("Username, Email, Phone are required");
    }
    
    try {
        const response = await fetch(`/api/admin/account/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username,
                password: password,
                phone: phone,
                email: email,
                notes: notes,
                status: status 
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Account updated successfully");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (err) {
        alert(err.message);
    }
}
