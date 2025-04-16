$(document).ready(function () {
    $.ajax({
        url: '/api/admin/roles',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const tbody = $('#datatable-search tbody');
            tbody.empty();

            data.forEach(r => {
                let actionHtml = '';
                if (r.role.toLowerCase() !== 'admin') {
                    actionHtml = `
                        <a href="javascript:;" data-id="${r.id}" class="edit-btn" data-bs-toggle="modal" data-bs-target="#roleModal">
                            <i class="fas fa-user-edit text-secondary"></i>
                        </a>
                        <a href="javascript:;" data-id="${r.id}" class="mx-3 delete-btn" data-bs-toggle="tooltip">
                            <i class="fas fa-trash text-secondary"></i>
                        </a>
                    `;
                }
                const roleHtml = `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="customCheck${r.id}">
                                </div>
                                <p class="text-xs font-weight-bold ms-2 mb-0">${r.id}</p>
                            </div>
                        </td>
                        <td class="text-xs font-weight-bold table-cell">${r.role}</td>
                        <td class="text-xs font-weight-bold table-cell">${r.description}</td>
                        <td class="text-sm">
                            ${actionHtml}
                        </td>
                    </tr>
                `;
                tbody.append(roleHtml);
            });

            $('[data-bs-toggle="tooltip"]').tooltip();
            
            const dataTableSearch = new simpleDatatables.DataTable("#datatable-search", {
                searchable: true,
                fixedHeight: false,
                perPageSelect: false
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
            console.error(error);
        }
    });
});

$(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');

    if (confirm("Do you want to delete this role?")) {
        $.ajax({
            url: `/api/admin/role/${id}/delete`,
            type: 'PATCH',
            success: function (res) {
                alert(res.message);
                location.reload();
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.detail;
                alert(message);
            }
        });
    }
});

$('#create-btn').on('click', async function () {
    $('#input-role-name').val("");
    $('#input-description').val("");

    $('#role-modal-title').text("New Role");
    $('#role-modal-description').text("Enter information to create a new role");
    $('#save-btn').text("Create");

    $('#save-btn').off('click').on('click', createRole);
});

$('#datatable-search tbody').on('click', '.edit-btn', async function () {
    const id = $(this).data('id');

    try {
        const response = await fetch(`/api/admin/role/${id}`);
        if (!response.ok) throw new Error("Failed to fetch role data");

        const role = await response.json();

        $('#input-role-name').val(role.role);
        $('#input-description').val(role.description);

        $('#role-modal-title').text("Update Role");
        $('#role-modal-description').text("Enter information to update role");
        $('#save-btn').text("Update");

        $('#save-btn').off('click').on('click', () => updateRole(id));
    } catch (error) {
        alert(error.message);
    }
});

async function createRole() {
    const roleName = document.getElementById('input-role-name').value.trim();
    const description = document.getElementById('input-description').value.trim();

    try {
        const response = await fetch('/api/admin/role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: roleName,
                description: description
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Role created successfully!");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (error) {
        alert(error.message);
    }
}

async function updateRole(id) {
    const roleName = document.getElementById('input-role-name').value.trim();
    const description = document.getElementById('input-description').value.trim();

    if (!roleName) return alert("Role name is required");

    try {
        const response = await fetch(`/api/admin/role/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                role: roleName,
                description: description 
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Role updated successfully");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (err) {
        alert(err.message);
    }
}
