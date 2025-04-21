const CartManager = (function() {
    let voucherApplied = false;
    let shippingFee = 35000;
    let voucherDiscount = 0;
    let nameOfVoucher = '';
    
    const VOUCHERS = {
        'TS001': {
            minAmount: 1000000,
            type: 'percentage',
            value: 0.05,
            description: 'Giảm 5% cho đơn hàng trên 1.000.000đ'
        },
        'TS002': {
            minAmount: 2000000,
            type: 'percentage',
            value: 0.08,
            description: 'Giảm 8% cho đơn hàng trên 2.000.000đ'
        },
        'FREESHIP': {
            minAmount: 500000,
            type: 'shipping',
            value: 'free',
            description: 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ'
        }
    };


    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }
    
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function calculateTotals() {
        const cart = getCart();
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        let shipping = (subtotal > 0) ? shippingFee : 0;
        
        let discount = voucherApplied ? voucherDiscount : 0;
        
        let grandTotal = Math.max(0, subtotal + shipping - discount);
        
        return {
            subtotal,
            discount,
            shipping,
            grandTotal
        };
    }
    
    function applyVoucher(code) {
        const cart = getCart();
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        voucherApplied = false;
        voucherDiscount = 0;
        
        const voucher = VOUCHERS[code];
        if (!voucher) {
            UI.showNotification('Mã giảm giá không hợp lệ', 'error');
            return;
        }
        
        if (subtotal < voucher.minAmount) {
            UI.showNotification(`Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này`, 'error');
            return;
        }
        
        if (voucher.type === 'percentage') {
            voucherDiscount = subtotal * voucher.value + shippingFee;
            nameOfVoucher = code;
            UI.showNotification(`Áp dụng mã giảm giá thành công: Giảm ${voucher.value * 100}%`);
        } else if (voucher.type === 'shipping') {
            voucherDiscount = shippingFee;
            nameOfVoucher = code;
            UI.showNotification('Áp dụng mã giảm giá thành công: Miễn phí vận chuyển');
        }
        
        voucherApplied = true;
        renderCart();
    }
    

    function renderCart() {
        const cart = getCart();
        const cartTable = $('#cart-items-detail');
        cartTable.empty();
        
        if (cart.length === 0) {
            cartTable.append(`
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                        <p class="lead">Giỏ hàng của bạn đang trống</p>
                    </td>
                </tr>
            `);
            $('#checkout-btn').prop('disabled', true);
        } else {
            $('#checkout-btn').prop('disabled', false);
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                
                cartTable.append(`
                    <tr class="cart-item">
                        <td class="cart-thumbnail">
                            <img src="${item.thumbnail}" alt="${item.title}" class="img-thumbnail">
                        </td>
                        <td class="product-name">
                            <a href="${item.slug}" class="product-title fw-bold text-decoration-none">${item.title}</a>
                            <p class="small text-muted mb-0">Kích thước: ${item.size} | Chất liệu: ${item.material}</p>
                            <p class="mobile-price d-md-none">${formatVND(itemTotal)}</p>
                        </td>
                        <td class="product-price d-none d-md-table-cell">${formatVND(item.price)}</td>
                        <td class="product-quantity-column d-none d-md-table-cell">
                            <div class="quantity-control">
                                <button class="decrease-quantity" data-index="${index}">−</button>
                                <input type="number" class="product-quantity" data-index="${index}" min="1" value="${item.quantity}" readonly>
                                <button class="increase-quantity" data-index="${index}">+</button>
                            </div>
                        </td>
                        <td class="subtotal d-none d-md-table-cell">${formatVND(itemTotal)}</td>
                        <td class="product-remove">
                            <button class="remove-item btn btn-sm btn-outline-danger" data-index="${index}" title="Xóa sản phẩm">
                                <i class="fas fa-times"></i>
                            </button>
                        </td>
                    </tr>
                `);            
            });
        }
        
        updateCartSummary();
    }
    

    function updateCartSummary() {
        const totals = calculateTotals();
        
        $('#total-price').text(formatVND(totals.subtotal));
        
        if ($('#cart-summary').length === 0) {
            $('.card p:contains("Tạm tính")').after('<div id="cart-summary"></div>');
        }
        
        if (voucherApplied && voucherDiscount > 0) {
            $('#cart-summary').html(`
                <p id="voucher-discount" class="text-success">
                    <i class="fas fa-tag me-2"></i>Giảm giá: - ${formatVND(voucherDiscount)}
                </p>
            `);
        } else {
            $('#voucher-discount').remove();
        }
        
        $('.voucher:contains("Phí giao hàng")').text(`Phí giao hàng: ${formatVND(totals.shipping)} (Vận chuyển đến Hà Nội)`);
        
        $('#grand-total').text(formatVND(totals.grandTotal));
    }
    
    function changeQuantity(index, delta) {
        const cart = getCart();
        
        if (index >= 0 && index < cart.length) {
            const newQuantity = cart[index].quantity + delta;
            
            if (newQuantity > 0) {
                cart[index].quantity = newQuantity;
                saveCart(cart);
                renderCart();
            }
        }
    }
    
    function removeItem(index) {
        const cart = getCart();
        
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
            UI.showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
        }
    }  
    
    function submitOrder() {
        const cart = getCart();
        
        if (cart.length === 0) {
            UI.showNotification('Giỏ hàng trống, không thể đặt hàng', 'error');
            return;
        }
        
        const name = $('#customerName').val().trim();
        const phone = $('#customerPhone').val().trim();
        const address = $('#customerAddress').val().trim();
        const notes = $('#orderNotes').val().trim();
        const price = $('#modalGrandTotal').text();
        
        if (!name || !phone || !address) {
            UI.showNotification('Vui lòng điền đầy đủ thông tin đặt hàng', 'error');
            return;
        }
        
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            UI.showNotification('Số điện thoại không hợp lệ', 'error');
            return;
        }
        
        let productDescription = '';
        const prices = [];
        $('.cart-item .product-price').each(function () {
            prices.push($(this).text().trim());
        });

        cart.forEach((item, index) => {
            const itemPrice = prices[index] || 'Không rõ giá';
            productDescription += `${item.title} - Kích thước: ${item.size} | Chất liệu: ${item.material} | Số lượng: ${item.quantity} | Giá: ${itemPrice}\n`;
        });
        productDescription += `Mã giảm giá: ${nameOfVoucher}\n`;
        
        
        const loadingModal = UI.showLoadingModal();
        
        const order = {
            name: name,
            phone: phone,
            address: address,
            product: productDescription,
            price: price,
            notes: notes,
            status: 'inactive',
            finished: 0
        };
        
        $.ajax({
            url: '/api/orders',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(order),
            timeout: 30000,
            success: function(response) {
                loadingModal.hide();
                
                if (response && response.success === true) {
                    localStorage.removeItem('cart');
                    
                    $('#orderModal').modal('hide');
                    
                    UI.showOrderSuccessModal();
                } else {
                    const errorMsg = response && response.error ? response.error : 'Không thể xử lý phản hồi từ server';
                    UI.showNotification(errorMsg, 'error');
                }
            },
            error: function(xhr, status, error) {
                loadingModal.hide();
                
                let errorMessage = 'Có lỗi xảy ra khi đặt hàng';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                UI.showNotification(errorMessage, 'error');
            }
        });
    }
    

    function initEventListeners() {
        $(document).on('click', '.increase-quantity', function() {
            const index = $(this).data('index');
            changeQuantity(index, 1);
        });
        
        $(document).on('click', '.decrease-quantity', function() {
            const index = $(this).data('index');
            changeQuantity(index, -1);
        });
        
        $(document).on('click', '.remove-item', function() {
            const index = $(this).data('index');
            removeItem(index);
        });
        
        $('.add-voucher').click(function() {
            const voucherCode = $('#voucher-input').val().trim();
            if (voucherCode) {
                applyVoucher(voucherCode);
            } else {
                UI.showNotification('Vui lòng nhập mã giảm giá', 'error');
            }
        });
        
        $('.voucher-code p').click(function() {
            $('#voucher-input').val($(this).text());
            $(this).addClass('bg-light');
            setTimeout(() => $(this).removeClass('bg-light'), 300);
        });
        
        $('#submitOrder').click(function() {
            submitOrder();
        });
        
        $('#orderModal').on('show.bs.modal', function() {
            updateOrderSummary();
        });
    }
    
    function updateOrderSummary() {
        const cart = getCart();
        const totals = calculateTotals();
        const orderSummary = $('#orderSummary');
        orderSummary.empty();
        
        let html = '<div class="list-group mb-3">';
        cart.forEach(item => {
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${item.title}</h6>
                            <small class="text-muted">Kích thước: ${item.size} | Chất liệu: ${item.material}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-primary rounded-pill">${item.quantity}</span>
                            <p class="mb-0 fw-bold">${formatVND(item.price * item.quantity)}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        html += `
            <div class="card card-body bg-light">
                <div class="d-flex justify-content-between mb-2">
                    <span>Tạm tính:</span>
                    <span>${formatVND(totals.subtotal)}</span>
                </div>
        `;
        
        if (voucherApplied && voucherDiscount > 0) {
            html += `
                <div class="d-flex justify-content-between mb-2 text-success">
                    <span>Giảm giá:</span>
                    <span>- ${formatVND(voucherDiscount)}</span>
                </div>
            `;
        }
        
        html += `
                <div class="d-flex justify-content-between mb-2">
                    <span>Phí giao hàng:</span>
                    <span>${formatVND(totals.shipping)}</span>
                </div>
                <div class="d-flex justify-content-between fw-bold">
                    <span>Tổng cộng:</span>
                    <span>${formatVND(totals.grandTotal)}</span>
                </div>
            </div>
        `;
        
        orderSummary.html(html);
        $('#modalGrandTotal').text(formatVND(totals.grandTotal));
    }
    
    return {
        init: function() {
            renderCart();
            initEventListeners();
        },
        applyVoucher: applyVoucher,
        submitOrder: submitOrder
    };
})();

const UI = (function() {
    function showNotification(message, type = 'success') {
        $('.notification').remove();
        
        const icon = type === 'success' ? 
            '<i class="fas fa-check-circle me-2"></i>' : 
            '<i class="fas fa-exclamation-circle me-2"></i>';
        
        const notificationEl = $('<div>', {
            class: `alert alert-${type === 'success' ? 'success' : 'danger'} notification`,
            html: icon + message
        });
        
        $('body').append(notificationEl);
        
        setTimeout(() => {
            notificationEl.fadeOut('slow', function() {
                $(this).remove();
            });
        }, 3000);
    }
    
    function showLoadingModal() {
        if ($('#loadingModal').length === 0) {
            const loadingModalHtml = `
                <div class="modal fade" id="loadingModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-body text-center p-4">
                                <div class="spinner-border text-primary mb-3" role="status">
                                    <span class="visually-hidden">Đang xử lý...</span>
                                </div>
                                <p class="mb-0">Đang xử lý đơn hàng của bạn, vui lòng chờ...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('body').append(loadingModalHtml);
        }
        
        const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
        loadingModal.show();
        return loadingModal;
    }
    

    function showOrderSuccessModal() {
        if ($('#orderSuccessModal').length === 0) {
            const successModal = `
                <div class="modal fade" id="orderSuccessModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-body text-center p-4">
                                <div class="success-animation mb-4">
                                    <i class="fas fa-check-circle text-primary" style="font-size: 64px;"></i>
                                </div>
                                <h4 class="mb-3">Cảm ơn bạn đã đặt hàng!</h4>
                                <p class="mb-3">Đơn hàng của bạn đã được ghi nhận thành công.</p>
                                <p class="mb-3">Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất để xác nhận đơn hàng.</p>
                                <p class="alert alert-info">Vui lòng giữ điện thoại và để ý cuộc gọi từ nhân viên của chúng tôi.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" onclick="window.location.href='/'">Tiếp tục mua sắm</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('body').append(successModal);
        }
        
        const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        successModal.show();
    }
    
    return {
        showNotification: showNotification,
        showLoadingModal: showLoadingModal,
        showOrderSuccessModal: showOrderSuccessModal
    };
})();

// Initialize when document is ready
$(document).ready(function() {
    CartManager.init();
    
    
    $('.btn').addClass('position-relative overflow-hidden');
    
    $('.add-voucher').prepend('<i class="fas fa-tag me-2"></i>');
    $('#checkout-btn').prepend('<i class="fas fa-credit-card me-2"></i>');
    $('button:contains("Tiếp tục xem sản phẩm")').prepend('<i class="fas fa-arrow-left me-2"></i>');
});
