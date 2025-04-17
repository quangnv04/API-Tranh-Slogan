$(document).ready(function () {
    $.ajax({
        url: '/api/admin/orders',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const tbody = $('#datatable-search tbody');
            tbody.empty();

            data.forEach(o => {
                const orderHtml = `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="customCheck${o.id}">
                                </div>
                                <p class="text-xs font-weight-bold ms-2 mb-0">${o.id}</p>
                            </div>
                        </td>
                        <td class="text-xs font-weight-bold table-cell">${o.name}</td>
                        <td class="text-xs font-weight-bold table-cell">${o.phone}</td>
                        <td class="text-xs font-weight-bold table-cell">${o.address}</td>
                        <td class="text-xs font-weight-bold table-cell">${o.price}</td>
                        <td class="text-xs font-weight-bold table-cell">${o.created_at}</td>
                        <td>
                            <div class="form-check form-switch">
                                <input class="form-check-input toggle-status-switch" type="checkbox" role="switch" data-hash="${o.hash}" ${o.status === 'active' ? 'checked' : ''}>
                            </div>
                        </td>
                        <td>
                            <div class="form-check form-switch">
                                <input class="form-check-input toggle-finished-switch" type="checkbox" role="switch" data-hash="${o.hash}" ${o.finished ? 'checked' : ''}>
                            </div>
                        </td>
                        <td class="text-sm">
                            <a href="javascript:;" class="toggle-details" data-hash="${o.hash}" data-bs-toggle="modal" data-bs-target="#orderDetailModal">
                                <i class="fas fa-eye text-secondary"></i>
                            </a>
                            <a href="javascript:;" class="mx-3 edit-btn" data-hash="${o.hash}" data-bs-toggle="modal" data-bs-target="#orderModal">
                                <i class="fas fa-user-edit text-secondary"></i>
                            </a>
                            <a href="javascript:;" class="print-btn" data-hash="${o.hash}" data-bs-toggle="modal" data-bs-target="#printModal">
                                <i class="fas fa-print text-secondary"></i>
                            </a>
                        </td>
                    </tr>
                `;
                tbody.append(orderHtml);
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
            console.error("Error fetching roles:", error);
        }
    });

    $('#datatable-search tbody').on('change', '.toggle-status-switch', async function () {
        const checkbox = $(this);
        const hash = checkbox.data('hash');
        const newStatus = checkbox.is(':checked') ? 'active' : 'inactive';

        try {
            const response = await fetch(`/api/admin/order/${hash}`, {
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

    $('#datatable-search tbody').on('change', '.toggle-finished-switch', async function () {
        const checkbox = $(this);
        const hash = checkbox.data('hash');
        const newFinished = checkbox.is(':checked') ? 1 : 0;

        try {
            const response = await fetch(`/api/admin/order/${hash}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ finished: newFinished })
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
    const hash = $(this).data('hash');

    try {
        const response = await fetch(`/api/admin/order/${hash}`);
        const data = await response.json();
        if (!response.ok) {
            return alert(data.detail);
        }

        $('#detail-id').text('Order #' + data.id);
        $('#detail-hash').text(data.hash);
        $('#detail-name').text(data.name);
        $('#detail-phone').text(data.phone);
        $('#detail-address').text(data.address);
        $('#detail-product').text(data.product);
        $('#detail-price').text(data.price);
        $('#detail-notes').text(data.notes);
        $('#detail-status').text(data.status);
        $('#detail-finished').text(data.finished == 1 ? 'Yes' : 'No');
        $('#detail-created-at').text(data.created_at);
    } catch (err) {
        alert(err.message);
    }
});

$('#datatable-search tbody').on('click', '.edit-btn', async function () {
    const hash = $(this).data('hash');

    try {
        const response = await fetch(`/api/admin/order/${hash}`);
        if (!response.ok) throw new Error("Failed to fetch order data");

        const order = await response.json();

        $('#input-name').val(order.name);
        $('#input-phone').val(order.phone);
        $('#input-address').val(order.address);
        $('#input-product').val(order.product).prop('disabled', true);
        $('#input-price').val(order.price).prop('disabled', true);
        $('#input-notes').val(order.notes);
        $('#status-switch').prop('checked', order.status == 'active');
        $('#finished-switch').prop('checked', order.finished == 1);

        $('#save-btn').off('click').on('click', () => updateOrder(hash));
    } catch (error) {
        alert(error.message);
    }
});

async function updateOrder(hash) {
    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const address = document.getElementById('input-address').value.trim();
    const notes = document.getElementById('input-notes').value.trim();
    const status = document.getElementById('status-switch').checked ? 'active' : 'inactive';
    const finished = document.getElementById('finished-switch').checked ? 1 : 0;
    
    const phoneRegex = /^(0|\+84)(\d{9})$/;
    if (!phoneRegex.test(phone)) {
        return alert("Invalid phone number. Please enter correct format (starts with 0 or +84, followed by 9 digits)");
    }

    if (!name || !phone || !address) return alert("Name, Phone number, Address is required");

    try {
        const response = await fetch(`/api/admin/order/${hash}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name,
                phone: phone,
                address: address,
                notes: notes,
                status: status,
                finished: finished
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Order updated successfully!");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (err) {
        alert(err.message);
    }
}

$(document).on('click', '.print-btn', async function () {
    const hash = $(this).data('hash');

    try {
        const response = await fetch(`/api/admin/order/${hash}`);
        const data = await response.json();

        if (!response.ok) return alert(data.detail);

        $('#print-id').text(data.id);
        $('#print-name').text(data.name);
        $('#print-phone').text(data.phone);
        $('#print-address').text(data.address);
        $('#print-product').text(data.product);
        $('#print-price').text(data.price);
        $('#print-notes').text(data.notes);
        $('#print-created-at').text(data.created_at);
    } catch (err) {
        alert(err.message);
    }
});

$('#btn-print-pdf').on('click', function () {
    const element = document.getElementById('order-preview');
    const opt = {
        margin:       0.5,
        filename:     `order_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
});
