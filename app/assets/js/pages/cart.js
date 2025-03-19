function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTable = $('#cart-items-detail');
    cartTable.empty();

    let total = 0;

    if (cart.length === 0) {
        cartTable.append('<tr><td colspan="4">Giỏ hàng trống</td></tr>');
    } else {
        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal + 35000;
            
            cartTable.append(`
                <tr class="cart-item">
                    <td class="product-thumbnail">
                        <img src="${item.thumbnail}" alt="${item.title}">
                    </td>
                    <td class="product-name">
                        <a href="${item.slug}" class="product-title">${item.title}</a>
                        <p>Kích thước: ${item.size} | Chất liệu: ${item.material}</p>
                        <p class="mobile-price">Số lượng: ${item.quantity} | ${formatVND(subtotal)}</p>
                    </td>
                    <td class="product-price">${formatVND(item.price)}</td>
                    <td>
                        <div class="quantity-control">
                            <button class="decrease-quantity btn btn-sm btn-light" data-index="${index}">-</button>
                            <input type="number" class="product-quantity" data-index="${index}" min="1" value="${item.quantity}" style="width: 50px; text-align: center;">
                            <button class="increase-quantity btn btn-sm btn-light" data-index="${index}">+</button>
                        </div>
                    </td>
                    <td class="subtotal">${formatVND(subtotal)}</td>
                    <td class="product-remove">
                        <button class="remove-item btn btn-primary btn-sm" data-index="${index}">×</button>
                    </td>
                </tr>
            `);            
        });
    }

    // Cập nhật tổng tiền
    
    $('#total-price').text(formatVND(total));
    $('#grand-total').text(formatVND(total + 35000));
};
$(document).ready(function () {
    //Render giỏ hàng khi tải trang
    renderCartItems();
});

// Xử lý tăng số lượng
$(document).on('click', '.increase-quantity', function () {
    const index = $(this).data('index');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }
});

// Xử lý giảm số lượng
$(document).on('click', '.decrease-quantity', function () {
    const index = $(this).data('index');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (index >= 0 && index < cart.length) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
        }
    }
});

// Xử lý xóa sản phẩm
$(document).on('click', '.remove-item', function () {
    const index = $(this).data('index');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }
});
