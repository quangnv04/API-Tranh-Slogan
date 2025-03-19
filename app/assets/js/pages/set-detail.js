$(document).ready(function () {
    let swiperWrapper = $('.swiper-wrapper');

    productSetImages.forEach(function (link) {
        const slide = $('<div class="swiper-slide"><img src="' + link + '" class="product-detail-swiper-image"></div>');
        swiperWrapper.append(slide);
    });

    new Swiper('.swiper-container', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        loop: true
    });
});

function updatePrice() {
    const selectedSize = document.querySelector('input[name="size"]:checked').value;
    const selectedMaterial = document.querySelector('input[name="material"]:checked').value;
    const selectedQuantity = parseInt(document.getElementById('quantity').value);
    let priceData = null;

    if (selectedMaterial === 'Canvas') {
        priceData = canvasPrice.find(item => item.size === selectedSize);
    }

    if (priceData && priceData.price) {
        const totalPrice = priceData.price * selectedQuantity;
        document.getElementById('price').textContent = formatVND(totalPrice);
    }
}

document.querySelectorAll('input[name="size"], input[name="material"], input[name="quantity"]').forEach(input => {
    input.addEventListener('change', updatePrice);
});

document.getElementById('increase-btn').addEventListener('click', () => {
    let currentQuantity = parseInt(document.getElementById('quantity').value);
    document.getElementById('quantity').value = currentQuantity + 1;
});

document.getElementById('decrease-btn').addEventListener('click', () => {
    let currentQuantity = parseInt(document.getElementById('quantity').value);
    if (currentQuantity > 1) {
        document.getElementById('quantity').value = currentQuantity - 1;
    }
});

updatePrice();

$(document).ready(function () {
    $(".read-more-btn").click(function () {
        var content = $(".read-more-content");
        if (content.is(":visible")) {
            content.slideUp();
            $(this).text("Đọc Thêm...");
        } else {
            content.slideDown();
            $(this).text("Thu Gọn");
        }
    });
});

$(document).ready(function () {
    function fetchRelatedProducts() {
        $.ajax({
            url: '/api/sets',
            method: 'GET',
            data: {
                page: 1,
                limit: 6
            },
            success: function (response) {
                if (response && response.length > 0) {
                    appendRelatedProducts(keysToCamelCase(response));
                }
            },
            error: function (error) {
                console.error("Không thể lấy sản phẩm liên quan:", error);
            }
        });
    }

    function appendRelatedProducts(products) {
        const container = $('.related-product');
        container.empty();

        products.forEach(function (product) {
            const productHtml = `
                <div class="related-product-item d-flex mb-3">
                    <a href="/set/${product.slug}" class="related-products-img">
                        <img class="related-product-img" alt="Ảnh sản phẩm" src="${product.thumbnail[0]}">
                    </a>
                    <div class="related-product-content ms-3">
                        <a href="/set/${product.slug}" class="related-product-title">${product.title}</a>
                        <div class="price" style="">
                                    <h3>
                                        339,000 ₫ - 519,000 ₫
                                        <span></span>
                                    </h3>
                                </div>
                    </div>
                </div>
            `;
            container.append(productHtml);
        });
    }

    fetchRelatedProducts();
});

$(document).ready(function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Lấy dữ liệu từ localStorage nếu có

    function updatePrice() {
        const selectedSize = $('input[name="size"]:checked').val();
        const selectedMaterial = $('input[name="material"]:checked').val();
        const selectedQuantity = parseInt($('#quantity').val());
        let priceData = (selectedMaterial === 'Canvas') ? canvasPrice.find(item => item.size === selectedSize) :
            micaPrice.find(item => item.size === selectedSize);

        if (priceData) {
            let totalPrice = priceData.price * selectedQuantity;
            $('#price').text(formatVND(totalPrice));
        }
    }

    function syncCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log(JSON.parse(localStorage.getItem('cart')));
        updateHeaderCart(); // Cập nhật giỏ hàng trên header
    }
    
    function updateHeaderCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartItems = $('#header-cart-items');
        cartItems.empty();
        let total = 0;

        if (cart.length === 0) {
            cartItems.append('<li>Giỏ hàng trống</li>');
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                cartItems.append(`
                    <li class="d-flex justify-content-around mb-3">
                        <div class="thumbnail-product-in-cart">
                            <img src="${item.thumbnail}" alt="${item.title}" style="height: 4rem">
                        </div>
                        <div class="info-product-in-cart">
                            <div class="name-product-in-cart">
                            <h6><a href="${item.slug}">${item.title}</a></h6>
                            </div>
                            <div class="size-product-in-cart">
                                <p>Kích thước: ${item.size} | Chất liệu: ${item.material}</p>
                            </div>
                            <div class="quatity-product-in-cart">
                                <p>Số lượng: ${item.quantity} | ${formatVND(item.price * item.quantity)}</p>
                            </div>
                        </div>
                         <button class="remove-item btn btn-outline-secondary btn-sm" data-index="${index}">X</button>
                    </li>
                `);
            });
        }
        $('#header-cart-total').text(formatVND(total));
    }

    $('.add-to-cart').click(function () {
        const productTitle = $("h1").text();
        const productThumbnail = productSetImages[0];
        const productSlug = $(location).attr('href');
        
        let selectedSize = $('input[name="size"]:checked').val();
        let selectedFrame = $('input[name="frame"]:checked').val();
        let selectedMaterial = $('input[name="material"]:checked').val();
        let selectedQuantity = parseInt($('#quantity').val());
        let price = parseInt($('#price').text().replace(/[^0-9]/g, ''));

        let existingItem = cart.find(item =>
            item.title === productTitle &&
            item.size === selectedSize &&
            item.material === selectedMaterial
        );

        if (existingItem) {
            existingItem.quantity += selectedQuantity;
        } else {
            cart.push({
                title: productTitle,
                thumbnail: productThumbnail ,
                slug: productSlug,
                size: selectedSize,
                frame: selectedFrame,
                material: selectedMaterial,
                quantity: selectedQuantity,
                price: price
            });
        }

        syncCartToLocalStorage();
        
        showCartToast(productTitle);
    });
    
    function showCartToast(productTitle) {
        // Set the toast message
        $('#cartToast .toast-body').text(`Bạn đã thêm thành công "${productTitle}" vào giỏ hàng`);
        
        // Initialize and show the toast
        var toast = new bootstrap.Toast(document.getElementById('cartToast'));
        toast.show();
    }

    // Khởi tạo giỏ hàng ngay khi tải trang
    updateHeaderCart();
    updatePrice();
});


