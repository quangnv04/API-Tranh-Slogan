

$(document).ready(function () {
    let swiperWrapper = $('.swiper-wrapper');

    productImages.forEach(function (link) {
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
    const $selectedSize = $('input[name="size"]:checked');
    const $selectedMaterial = $('input[name="material"]:checked');
    const quantityVal = $('#quantity').val();

    if ($selectedSize.length === 0 || $selectedMaterial.length === 0 || !quantityVal) {
        $('#price').text('');
        return;
    }

    const selectedSize = $selectedSize.val();
    const selectedMaterial = $selectedMaterial.val();
    const selectedQuantity = parseInt(quantityVal);
    let priceData = null;

    if (selectedMaterial === 'Canvas') {
        priceData = canvasPrice.find(item => item.size === selectedSize);
    } else if (selectedMaterial === 'Mica') {
        priceData = micaPrice.find(item => item.size === selectedSize);
    }

    if (priceData && priceData.price) {
        const totalPrice = priceData.price * selectedQuantity;
        $('#price').text(formatVND(totalPrice));
    } else {
        $('#price').text('Liên hệ');
    }
}

document.querySelectorAll('input[name="size"], input[name="material"], input[name="quantity"]').forEach(input => {
    input.addEventListener('change', updatePrice);
});

document.getElementById('increase-btn').addEventListener('click', () => {
    let currentQuantity = parseInt(document.getElementById('quantity').value);
    document.getElementById('quantity').value = currentQuantity + 1;
    updatePrice();
});

document.getElementById('decrease-btn').addEventListener('click', () => {
    let currentQuantity = parseInt(document.getElementById('quantity').value);
    if (currentQuantity > 1) {
        document.getElementById('quantity').value = currentQuantity - 1;
    }
    updatePrice();
});

// updatePrice();
function getTypeFromUrl() {
    const path = window.location.pathname;
    const slug = path.split('/product/')[1]; // lấy phần sau '/product/'
    
    if (!slug) return null;

    const typeSlug = slug.split('-ts')[0]; // lấy phần 'tranh-dong-luc' từ 'tranh-dong-luc-ts358...'
    
    return typeSlug;
}

const sizeOptionsByType = {
    "tranh-thuan-buom-xuoi-gio": [
        { "id": "70x100", "label": "70x100cm" },
        { "id": "80x120", "label": "80x120cm" },
        { "id": "100x150", "label": "100x150cm" }
    ],
    "tranh-dong-luc": [
        { id: "30x40", label: "30x40cm" },
        { id: "40x60", label: "40x60cm" },
        { id: "50x70", label: "50x70cm" },
        { id: "60x90", label: "60x90cm" }
    ],
    "tranh-tieng-anh": [
        { id: "30x40", label: "30x40cm" },
        { id: "40x60", label: "40x60cm" },
        { id: "50x70", label: "50x70cm" },
        { id: "60x90", label: "60x90cm" }
    ],
    "tranh-quan-tra-sua": [
        { id: "30x40", label: "30x40cm" },
        { id: "40x60", label: "40x60cm" },
        { id: "50x70", label: "50x70cm" },
        { id: "60x90", label: "60x90cm" }
    ],
    "tranh-tuc-ngu": [
        { id: "30x40", label: "30x40cm" },
        { id: "40x60", label: "40x60cm" },
        { id: "50x70", label: "50x70cm" },
        { id: "60x90", label: "60x90cm" }
    ],
    "tranh-doanh-nhan": [
        { "id": "30x40", "label": "30x40cm" },
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "tranh-ca-chep": [
        { "id": "60x120", "label": "60x120cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "90x180", "label": "90x180cm" }
    ],
    "tranh-chim-cong": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100" },
        { "id": "60x120", "label": "60x120cm" }
    ],
    "tranh-hoa-mau-don": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100cm" },
        { "id": "60x120", "label": "60x120cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "90x180", "label": "90x180cm" },
        { "id": "100x200", "label": "100x200cm" }
    ],
    "tranh-rong": [
        { "id": "60x120", "label": "60x120cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "100x200", "label": "100x200cm" }
    ],
    "tranh-tu-quy": [
        { "id": "46x76", "label": "46x76cm" },
        { "id": "56x96", "label": "56x96cm" },
        { "id": "66x116", "label": "66x116cm" }
    ],
    "tranh-ma-dao-thanh-cong": [
        { "id": "70x100", "label": "70x100cm" },
        { "id": "80x120", "label": "80x120cm" },
        { "id": "100x150", "label": "100x150cm" }
    ],
    "tranh-son-thuy-huu-tinh": [
        { "id": "40x40", "label": "40x40cm" },
        { "id": "50x50", "label": "50x50cm" },
        { "id": "60x60", "label": "60x60cm" },
        { "id": "100x100", "label": "100x100cm" },
    ],
    "tranh-huou-nai": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100cm" },
        { "id": "60x120", "label": "60x120cm" }
    ],
    "tranh-nghe-thuat": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" },
        { "id": "70x100", "label": "70x100cm" }
    ],
    "tranh-hoa-la": [
        { "id": "80x80", "label": "80x80cm" },
        { "id": "100x100", "label": "100x100cm" }
    ],
    "tranh-con-vat": [
        { "id": "40x40", "label": "40x40cm" },
        { "id": "50x50", "label": "50x50cm" },
        { "id": "60x60", "label": "60x60cm" }
    ],
    "tranh-phat-giao": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "tranh-cong-giao": [
        { "id": "70x100", "label": "70x100cm" },
        { "id": "80x120", "label": "80x120cm" },
        { "id": "100x150", "label": "100x150cm" }
    ],
    "tranh-3d": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100cm" }
    ],
    "tranh-cau-thu-bong-da": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "tranh-co-gai-nghe-thuat": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "tranh-phuc-loc-tho": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x100", "label": "50x100cm" }
    ],
    "tranh-thu-phap": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100cm" },
        { "id": "60x120", "label": "60x120cm" }
    ],
    "tranh-ly-ruou": [
        { "id": "30x40", "label": "30x40cm" },
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" }
    ],
    "tranh-gau-bearbrick-kaws-nghe-thuat": [
        { "id": "30x40", "label": "30x40cm" },
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" }
    ],
    "tranh-nhan-vat-hoat-hinh-sieu-anh-hung": [
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "tranh-vi-nhan-nhan-vat-lich-su": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "xuong-in-tranh-anh-cuoi-theo-yeu-cau": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "xuong-in-tranh-anh-ki-yeu-tot-nghiep-theo-yeu-cau": [
        { "id": "40x60", "label": "40x60cm" },
        { "id": "50x70", "label": "50x70cm" },
        { "id": "60x90", "label": "60x90cm" }
    ],
    "tranh-lich": [
        { "id": "50x70", "label": "50x70cm" }
    ],
    "tranh-phu-dieu-tranh-treo-tuong-co-khung-cao-cap": [
        { "id": "60x120", "label": "60x120cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "90x180", "label": "90x180cm" }
    ],
    "bien-bao": [
        { "id": "21x30", "label": "21x30cm" }
    ],
    "tranh-lien-treo-tuong": [
        { "id": "30x90", "label": "30x90cm" }
    ],
    "tranh-tron-trang-guong": [
        { "id": "40x40", "label": "40x40cm" },
        { "id": "50x50", "label": "50x50cm" },
        { "id": "60x60", "label": "60x60cm" }
    ],
    "tranh-dong-ho-treo-tuong": [
        { "id": "Đường kính 30cm", "label": "Đường kính 30cm" },
        { "id": "Đường kính 40cm", "label": "Đường kính 40cm" }
    ],
    "tranh-canvas": [
        { "id": "70x100", "label": "70x100cm" },
        { "id": "80x120", "label": "80x120cm" },
        { "id": "100x150", "label": "100x150cm" }
    ],
    "tranh-phong-canh-thien-nhien": [
        { "id": "60x120", "label": "40x60cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "90x180", "label": "90x180cm" }
    ],
    "tranh-phong-canh-viet-nam": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100cm" },
        { "id": "60x120", "label": "60x120cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "90x180", "label": "90x180cm" },
        { "id": "100x200", "label": "100x200cm" }
    ],
    "tranh-phong-canh-nuoc-ngoai": [
        { "id": "30x60", "label": "30x60cm" },
        { "id": "40x80", "label": "40x80cm" },
        { "id": "50x100", "label": "50x100cm" },
        { "id": "60x120", "label": "60x120cm" },
        { "id": "70x140", "label": "70x140cm" },
        { "id": "80x160", "label": "80x160cm" },
        { "id": "90x180", "label": "90x180cm" },
        { "id": "100x200", "label": "100x200cm" }
    ]    
};

function renderSizeOptions() {
    const type = getTypeFromUrl();
    const $container = $(".size-options .value");
    $container.empty(); 

    const sizes = sizeOptionsByType[type] || [];    

    $.each(sizes, function(index, size) {
        const inputId = `size-${size.id}`;

        const $input = $("<input>")
            .attr({
                type: "radio",
                id: inputId,
                name: "size",
                value: size.id
            });

        if (index === 0) {
            $input.prop("checked", true);
        }

        const $label = $("<label>")
            .attr("for", inputId)
            .text(size.label);

        $container.append($input, $label);
        
    });
}

$(document).ready(function () {
    updatePrice();
    renderSizeOptions(type);
    
});

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
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/products?type=${encodeURIComponent(type.trim())}&page=1&limit=5`,
                method: 'GET',
                dataType: 'json',
                success: function (response) {
                    if (response && typeof response === 'object' && response.products && response.products.length > 0) {
                        appendRelatedProducts(keysToCamelCase(response.products));
                    }
                    resolve(); // Báo hoàn thành
                },
                error: function (error) {
                    console.error("Không thể lấy sản phẩm liên quan:", error);
                    reject(error); // Báo lỗi

                }
            });
        });
    }

    function appendRelatedProducts(products) {
        const container = $('.page-content .right-home-product .hot-product-items');
        container.empty();

        products.forEach(function (product, index) {

            const productHtml = `
                <div class="row items">
                            <div class="col-4">
                                <img class="w-100" src="${product.thumbnail[0]}" alt="Tranh" />
                            </div>
                            <div class="ps-0 col-8">
                            <h6 class="fs-6 fw-light">
                            <a href="/product/${product.slug}">${product.title.length > 59 ? product.title.substring(0, 56) + "..." : product.title}</a>
                            </h6>
                                <div class="price-group">
                                    <del class="old-price">590.000đ</del>
                                    <span class="price sale-price fs-6">470.000đ</span>
                                    <span class="badge">-20%</span>
                                </div>
                            </div>
                        </div>
                        ${index < 4 ? '<hr class="my-3" />' : ''}`
                ;
            container.append(productHtml);
        });
    }
    function fetchProducts() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/products?page=1&limit=20`,
                type: 'GET',
                dataType: 'json',
                success: data => {
                    if (data && typeof data === 'object' && data.products && data.products.length > 0) {
                        appendProducts(keysToCamelCase(data.products));
                    }
                    resolve(); // Báo hoàn thành

                },
                error: error => {
                    console.error("Error fetching products:", error);
                    reject(error); // Báo lỗi

                }
            });
        });
    }
    function appendProducts(products) {
        const container = $('#products-container');

        products.forEach(function (product) {
            const productHtml = `
                <div class="col-lg-3 col-md-6 d-flex">
                    <div class="product-box d-flex">
                        <div class="product">
                            <div class="product-img">
                                <div class="swiper-wrapper">
                                    <a href="/product/${product.slug}">
                                        <img class="img-fluid" alt="Img" src="${product.thumbnail[0]}">
                                    </a>
                                </div>
                            </div>
                            <div class="product-content">
                                <h3 class="title instructor-text">
                                    <a href="/product/${product.slug}">${product.title}</a>
                                </h3>
                                <div class="product-info align-items-center">
                                    <div class="rating-img d-flex align-items-center mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                                            <path fill-rule="evenodd" d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                                            <path fill-rule="evenodd" d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                                            <path fill-rule="evenodd" d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                                            <path fill-rule="evenodd" d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"></path>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                                            <path fill-rule="evenodd" d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06l8.62-5 8.63 5a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.55-1.73l-9.86-1.28-4.12-8.88a1 1 0 0 0-1.82 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div class="price" style="">
                                    <h3>
                                        199,000 ₫ - 459,000 ₫
                                        <span></span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.append(productHtml);
        });

    }
    async function fetchAllData() {
        try {
            await fetchProducts(); // Gọi fetchProducts
            await fetchRelatedProducts(); // Gọi fetchRelatedProducts
        } catch (error) {
            console.error("Error fetching all data:", error);
        }
    };


    fetchAllData(); // Gọi hàm fetchAllData khi trang được tải
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
        const productThumbnail = productImages[0];
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
                thumbnail: productThumbnail,
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
    
    $('.buy-now').click(function () {
        const productTitle = $("h1").text();
        const productThumbnail = productImages[0];
        const productSlug = $(location).attr('href');
    
        let selectedSize = $('input[name="size"]:checked').val();
        let selectedFrame = $('input[name="frame"]:checked').val();
        let selectedMaterial = $('input[name="material"]:checked').val();
        let selectedQuantity = parseInt($('#quantity').val());
        let price = parseInt($('#price').text().replace(/[^0-9]/g, ''));
    
        let item = {
            title: productTitle,
            thumbnail: productThumbnail,
            slug: productSlug,
            size: selectedSize,
            frame: selectedFrame,
            material: selectedMaterial,
            quantity: selectedQuantity,
            price: price
        };
    
        // Lưu sản phẩm cần mua ngay vào localStorage
        localStorage.setItem('buyNowItem', JSON.stringify(item));
    
        // Nếu chưa có trong cart, thêm vào
        let existingItem = cart.find(i =>
            i.title === item.title &&
            i.size === item.size &&
            i.material === item.material
        );
        if (!existingItem) {
            cart.push(item);
            syncCartToLocalStorage();
        }
        
        window.location.href = '/cart';
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


