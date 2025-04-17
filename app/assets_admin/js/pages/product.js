$(document).ready(function () {
    $.ajax({
        url: '/api/admin/products',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const tbody = $('#datatable-search tbody');
            tbody.empty();
            tbody.css('height', '');

            data.forEach(p => {
                rowHtml = `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="customCheck${p.id}">
                                </div>
                                <p class="text-xs font-weight-bold table-cell ms-2 mb-0">${p.id}</p>
                            </div>
                        </td>
                        <td class="text-xs font-weight-bold table-cell">${p.sku}</td>
                        <td class="text-xs font-weight-bold table-cell">${p.title}</td>
                        <td class="text-xs font-weight-bold table-cell">${p.type}</td>
                        <td class="text-xs font-weight-bold table-cell">${p.discount}</td>
                        <td class="text-xs font-weight-bold table-cell">${p.updated_at}</td>
                        <td>
                            <div class="form-check form-switch">
                                <input class="form-check-input toggle-publish-switch" type="checkbox" role="switch" data-hash="${p.hash}" ${p.publish ? 'checked' : ''}>
                            </div>
                        </td>
                        <td class="text-sm">
                            <a href="javascript:;" class="toggle-details" data-hash="${p.hash}" data-bs-toggle="modal" data-bs-target="#productDetailModal">
                                <i class="fas fa-eye text-secondary"></i>
                            </a>
                            <a href="javascript:;" class="mx-3 edit-btn" data-hash="${p.hash}" data-bs-toggle="modal" data-bs-target="#productModal">
                                <i class="fas fa-user-edit text-secondary"></i>
                            </a>
                            <a href="javascript:;" class="delete-btn" data-hash="${p.hash}" data-bs-toggle="tooltip">
                                <i class="fas fa-trash text-secondary"></i>
                            </a>
                        </td>
                    </tr>
                `;
                tbody.append(rowHtml);
            });

            thHtml = `
                <tr>
                    <th>ID</th>
                    <th>SKU</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Discount</th>
                    <th>Updated At</th>
                    <th>Publish</th>
                    <th>Action</th>
                </tr>
            `;
            const thead = $('#datatable-search thead');
            thead.append(thHtml);
            
            $('[data-bs-toggle="tooltip"]').tooltip();

            const table = new simpleDatatables.DataTable("#datatable-search", {
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
            console.error("Error fetching products:", error);
        }
    });
    
    $('#datatable-search tbody').on('change', '.toggle-publish-switch', async function () {
        const checkbox = $(this);
        const hash = checkbox.data('hash');
        const newPublish = checkbox.is(':checked') ? 1 : 0;

        try {
            const response = await fetch(`/api/admin/product/${hash}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publish: newPublish })
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
        const response = await fetch(`/api/admin/product/${hash}`);
        const data = await response.json();
        if (!response.ok) {
            return alert(data.detail);
        }

        $('#detail-id').text('Product #' + data.id);
        $('#detail-hash').text(data.hash);
        $('#detail-sku').text(data.sku);
        $('#detail-title').text(data.title);
        $('#detail-slug').text(data.slug);
        $('#detail-type').text(data.type);
        $('#detail-canvas-price').text(data.canvas_price);
        $('#detail-mica-price').text(data.mica_price);
        $('#detail-discount').text(data.discount);
        $('#detail-description').text(data.description);
        $('#detail-publish').text(data.publish == 1 ? 'Yes' : 'No');
        $('#detail-created-at').text(data.created_at);
        $('#detail-updated-at').text(data.updated_at);
        $('#detail-image').attr('src', data.thumbnail[0]);
    } catch (err) {
        alert(err.message);
    }
});

$(document).on('click', '.delete-btn', function () {
    const hash = $(this).data('hash');

    if (confirm("Do you want to delete this product?")) {
        $.ajax({
            url: `/api/admin/product/${hash}/delete`,
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
    $('#input-sku').val("").prop('disabled', false);
    $('#input-title').val("");
    $('#input-type').val("");
    $('#input-slug').val("").prop('disabled', true);
    $('#input-canvas-price').val("");
    $('#input-mica-price').val("");
    $('#input-discount').val("");
    $('#input-images').val("");
    $('#input-description').val("");
    $('#publish-switch').prop('checked', true);

    $('#product-modal-title').text("New Product");
    $('#product-modal-description').text("Enter information to create a new product");
    $('#save-btn').text("Create");

    $('#save-btn').off('click').on('click', createProduct);
});

$('#datatable-search tbody').on('click', '.edit-btn', async function () {
    const hash = $(this).data('hash');

    try {
        const response = await fetch(`/api/admin/product/${hash}`);
        if (!response.ok) throw new Error("Failed to fetch product data");

        const product = await response.json();

        $('#input-sku').val(product.sku).prop('disabled', true);
        $('#input-title').val(product.title);
        $('#input-type').val(product.type);
        $('#input-slug').val(product.slug).prop('disabled', true);
        $('#input-canvas-price').val(product.canvas_price);
        $('#input-mica-price').val(product.mica_price);
        $('#input-discount').val(product.discount);
        $('#input-images').val(product.images);
        $('#input-description').val(product.description);
        $('#publish-switch').prop('checked', product.publish == 1);

        $('#product-modal-title').text("Update Product");
        $('#product-modal-description').text("Enter information to update product");
        $('#save-btn').text("Update");

        $('#save-btn').off('click').on('click', () => updateProduct(hash));
    } catch (error) {
        alert(error.message);
    }
});

async function createProduct() {
    const sku = document.getElementById('input-sku').value.trim();
    const title = document.getElementById('input-title').value.trim();
    const slug = document.getElementById('input-slug').value.trim();
    const type = document.getElementById('input-type').value.trim();
    const canvas_price = document.getElementById('input-canvas-price').value.trim();
    const mica_price = document.getElementById('input-mica-price').value.trim();
    const discount = document.getElementById('input-discount').value.trim();
    const images = document.getElementById('input-images').value.trim();
    const description = document.getElementById('input-description').value.trim();
    const publish = document.getElementById('publish-switch').checked ? 1 : 0;
    
    try {
        const response = await fetch('/api/admin/product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                
                sku: sku,
                title: title,
                slug: slug,
                type: type,
                canvas_price: canvas_price,
                mica_price: mica_price,
                discount: discount,
                images: images,
                description: description,
                publish: publish
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Products created successfully!");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (error) {
        alert(error.message);
    }
}

async function updateProduct(hash) {
    const title = document.getElementById('input-title').value.trim();
    const slug = document.getElementById('input-slug').value.trim();
    const type = document.getElementById('input-type').value.trim();
    const canvas_price = document.getElementById('input-canvas-price').value.trim();
    const mica_price = document.getElementById('input-mica-price').value.trim();
    let discount = document.getElementById('input-discount').value.trim();
    const images = document.getElementById('input-images').value.trim();
    const description = document.getElementById('input-description').value.trim();
    const publish = document.getElementById('publish-switch').checked ? 1 : 0;

    if (!title || !type || !canvas_price || !mica_price || !images) 
        return alert("Title, Type, Canvas price, Mica price, Images is required");

    if (discount) {
        discount = parseFloat(discount);
        if (isNaN(discount)) {
            alert("Discount must be a number");
            return;
        }
        if (discount < 0 || discount > 100)
            return alert("Discount must be between 0 and 100");
    }

    try {
        const response = await fetch(`/api/admin/product/${hash}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                slug: slug,
                type: type,
                canvas_price: canvas_price,
                mica_price: mica_price,
                discount: discount,
                images: images,
                description: description,
                publish: publish
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Product updated successfully!");
            location.reload();
        } else {
            alert(result.detail);
        }
    } catch (err) {
        alert(err.message);
    }
}

function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize("NFD")                   // remove accents
        .replace(/[\u0300-\u036f]/g, "")    // remove accents continued
        .replace(/đ/g, "d")                    // convert đ
        .replace(/[^a-z0-9\s-]/g, "")       // remove invalid chars
        .trim()                             // trim whitespace
        .replace(/\s+/g, "-");              // replace spaces with -
}

function updateSlug() {
    const type = document.getElementById('input-type').value || "";
    const sku = document.getElementById('input-sku').value || "";
    const title = document.getElementById('input-title').value || "";

    const raw = `${type} ${sku} ${title}`;
    const slug = generateSlug(raw);

    document.getElementById('input-slug').value = slug;
}

document.getElementById('input-type').addEventListener('input', updateSlug);
document.getElementById('input-sku').addEventListener('input', updateSlug);
document.getElementById('input-title').addEventListener('input', updateSlug);
