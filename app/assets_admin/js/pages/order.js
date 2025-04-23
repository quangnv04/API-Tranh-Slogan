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
        $('#input-product').val(order.product);
        $('#input-price').val(order.price);
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
    const product = document.getElementById('input-product').value.trim();
    const price = document.getElementById('input-price').value.trim();
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
                product: product,
                price: price,
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

        $('#print-id').text(String(data.id).padStart(7, '0'));
        $('#print-name').text(data.name);
        $('#print-phone').text(data.phone);
        $('#print-address').text(data.address);

        const date = new Date(data.created_at);
        const formattedDate = date.toLocaleDateString('vi-VN');
        $('#print-created-at').text(formattedDate);

        const productText = data.product;
        const lines = productText.split(/\n/);

        const tbody = $('#print-product-table tbody');
        tbody.empty();

        let grandTotal = 0;
        let discountCode = '';
        let index = 0;

        lines.forEach((line) => {
            if (!line.trim()) return;

            if (line.trim().startsWith('Mã giảm giá:')) {
                const discountMatch = line.match(/Mã giảm giá:\s*(\w+)/);
                if (discountMatch) discountCode = discountMatch[1].trim();
                return;
            }

            const name = line.split('| Số lượng:')[0].trim();
            const qtyMatch = line.match(/Số lượng:\s*(.+?)\s*\|/);
            const quantity = qtyMatch ? parseInt(qtyMatch[1].trim()) : 0;

            const priceMatch = line.match(/Giá:\s*([^\|]+)/);
            const priceText = priceMatch ? priceMatch[1].replace(/[^\d]/g, '') : '0';
            const price = parseInt(priceText, 10);

            const total = price * quantity;
            grandTotal += total;

            const row = `
                <tr>
                    <td>${++index}</td>
                    <td class="text-start" style="white-space: normal; word-break: break-word; max-width: 500px;">${name}</td>
                    <td>${quantity}</td>
                    <td>${formatVND(price)}</td>
                    <td>${formatVND(total)}</td>
                </tr>
            `;
            tbody.append(row);
        });

        let discountPercent = 0;
        let deliveryFee = 35000;

        if (discountCode === 'TS001') {
            discountPercent = 5;
            deliveryFee = 0;
        } else if (discountCode === 'TS002') {
            discountPercent = 8;
            deliveryFee = 0;
        } else if (discountCode === 'FREESHIP') {
            discountPercent = 0;
            deliveryFee = 0;
        }

        const discountAmount = Math.floor(grandTotal * (discountPercent / 100));
        if (discountAmount > 0) {
            grandTotal -= discountAmount;
            tbody.append(`
                <tr>
                    <td>${++index}</td>
                    <td colspan="3" class="text-start">Mã giảm giá: ${discountCode} (${discountPercent}%):</td>
                    <td>- ${formatVND(discountAmount)}</td>
                </tr>
            `);
        }

        grandTotal += deliveryFee;
        tbody.append(`
            <tr>
                <td>${++index}</td>
                <td colspan="3" class="text-start">Phí giao hàng:</td>
                <td>${formatVND(deliveryFee)}</td>
            </tr>
            <tr>
                <td colspan="4">Cộng tiền hàng hóa:</td>
                <td>${formatVND(grandTotal)}</td>
            </tr>
            <tr>
                <td colspan="4">Chiết khấu (VNĐ):</td>
                <td>
                    <input  id="discount-manual" class="form-control" value="0" min="0" style="width: 150px; text-align: center; border-radius: 5px; border: none;">
                </td>
            </tr>
            <tr>
                <td colspan="4"><strong>Số tiền cần thanh toán:</strong></td>
                <td><strong id="print-final-total">${formatVND(grandTotal)}</strong></td>
            </tr>
            <tr class="row-total-word">
                <td colspan="5" class="text-start">Số tiền viết bằng chữ: ${convertNumberToWords(grandTotal)}</td>
            </tr>
        `);

        // Cập nhật số tiền cần thanh toán khi thay đổi chiết khấu tay
        $('#discount-manual').off('input').on('input', function () {
            const manualDiscount = parseInt($(this).val().replace(/[^\d]/g, '')) || 0;
            const finalAmount = Math.max(grandTotal - manualDiscount, 0);
            $('#print-final-total').text(formatVND(finalAmount));

            // Cập nhật số tiền viết bằng chữ
            $('.row-total-word').remove();
            $('#print-product-table tbody').parent().append(`
                <tr class="row-total-word">
                    <td colspan="5" class="text-start">Số tiền viết bằng chữ: ${convertNumberToWords(finalAmount)}</td>
                </tr>
            `);
        });

    } catch (err) {
        alert(err.message);
    }
});


function formatVND(number) {
    return new Intl.NumberFormat('vi-VN').format(number) + ' đ';
}

function convertNumberToWords(number) {
    const Tien = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    
    if (number === 0) return "Không đồng";

    let str = "";
    let numStr = number.toString();
    let pos = 0;

    while (numStr.length > 0) {
        let chunk = numStr.length >= 3 ? numStr.slice(-3) : numStr;
        numStr = numStr.slice(0, -chunk.length);
        let chunkWords = readChunk(parseInt(chunk));
        if (chunkWords !== "") {
            str = chunkWords + " " + Tien[pos] + " " + str;
        }
        pos++;
    }

    str = str.replace(/\s+/g, ' ').trim();
    str = str.charAt(0).toUpperCase() + str.slice(1) + " đồng";
    return str;
}

function readChunk(number) {
    const ChuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    let tram = Math.floor(number / 100);
    let chuc = Math.floor((number % 100) / 10);
    let donVi = number % 10;
    let result = "";

    if (tram > 0) {
        result += ChuSo[tram] + " trăm ";
        if (chuc === 0 && donVi > 0) result += "lẻ ";
    } else if (number >= 100) {
        result += "không trăm ";
    }

    if (chuc > 1) {
        result += ChuSo[chuc] + " mươi ";
        if (donVi === 1) result += "mốt ";
        else if (donVi === 5) result += "lăm ";
        else if (donVi > 0) result += ChuSo[donVi] + " ";
    } else if (chuc === 1) {
        result += "mười ";
        if (donVi === 5) result += "lăm ";
        else if (donVi > 0) result += ChuSo[donVi] + " ";
    } else if (chuc === 0 && donVi > 0) {
        result += ChuSo[donVi] + " ";
    }

    return result.trim();
}

$('#btn-print-pdf').on('click', function () {
    const element = document.getElementById('order-preview');
    const sdt = document.getElementById('print-phone').innerText.trim();
    const createdAt = document.getElementById('print-created-at').innerText.trim();
    const opt = {
        margin:       0.5,
        filename:     `order_${sdt}_${createdAt}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
});
