// $(function () {
//     $('.header-filter-location').click(function (event) {
//         event.stopPropagation();
//         toggleDropdown(
//             '.header-filter-location-dropdown',
//             '.header-filter-location',
//             ['.header-filter-guests-dropdown'],
//             ['.header-filter-guests']
//         );
//     });

//     $('.header-filter-location-dropdown, .header-filter-guests-dropdown').click(function (event) {
//         event.stopPropagation();
//     });

    // $('.header-filter-guests').click(function (event) {
    //     event.stopPropagation();
    //     toggleDropdown(
    //         '.header-filter-guests-dropdown',
    //         '.header-filter-guests',
    //         ['.header-filter-location-dropdown'],
    //         ['.header-filter-location']
    //     );
    // });

//     $(document).click(function () {
//         const dropdowns = ['.header-filter-location-dropdown', '.header-filter-guests-dropdown'];
//         const filters = ['.header-filter-location', '.header-filter-guests'];
//         dropdowns.forEach(dropdown => $(dropdown).addClass('d-none'));
//         filters.forEach(filter => $(filter).removeClass('header-filter-active'));
//         $('.listing_filter_header').removeClass('header-filter-active-background');
//     });
// });

// function toggleDropdown(targetDropdown, targetFilter, otherDropdowns, otherFilters) {
//     otherDropdowns.forEach(dropdown => $(dropdown).addClass('d-none'));
//     otherFilters.forEach(filter => $(filter).removeClass('header-filter-active'));

//     const isActive = $(targetFilter).hasClass('header-filter-active');

//     $(targetDropdown).toggleClass('d-none', isActive);
//     $(targetFilter).toggleClass('header-filter-active');
//     $('.listing_filter_header').toggleClass('header-filter-active-background', !isActive);
// }

// const closeMobileFilter = () => {
//     $("#mobile-filter").removeClass("show");
//     setTimeout(() => {
//         $("#mobile-filter").css("display", "none");
//         $('body').css("overflow", "auto");
//     }, 10);
// }

// let filterDistrictChangeEvent = true;
// function uncheckAllDistricts() {
//     filterDistrictChangeEvent = false;
//     $(".filter-district-option").each(function () {
//         const checkbox = $(this).find('input[type="checkbox"]');
//         checkbox.prop('checked', false).change();
//     });
// }

// $(document).ready(function () {
//     const modal = $("#mobile-filter");
//     const btn = $("#openModalBtn");
//     const span = $(".filter-close").first();

//     btn.click(function () {
//         modal.css("display", "block");
//         $('body').css("overflow", "hidden");
//         setTimeout(() => modal.addClass("show"), 10);
//     });

//     span.click(function () {
//         closeMobileFilter();
//     });

//     $(window).click(function (event) {
//         if (event.target === modal[0]) {
//             modal.removeClass("show");
//             setTimeout(() => {
//                 modal.css("display", "none");
//                 $('body').css("overflow", "auto");
//             }, 100);
//         }
//     });

//     const allCollapsible = $(".collapsible");

//     allCollapsible.each(function () {
//         const collapsible = $(this);
//         const trigger = collapsible.find('.filter-collapsible-trigger');
//         const content = collapsible.find('.filter-collapsible-content');

//         if (trigger.length) {
//             trigger.click(function () {
//                 const expanded = trigger.attr('aria-expanded') === 'true';
//                 trigger.attr('aria-expanded', !expanded);
//                 content.css('margin-top', expanded ? '0' : '15px');
//             });
//         }
//     });

//     const districtOptions = $(".filter-district-option");
//     districtOptions.each(function () {
//         const option = $(this);
//         const checkbox = option.find('input[type="checkbox"]');
//         const span = option.find('span');

//         function updateCheckboxState() {
//             const svg = checkbox.next();
//             if (checkbox.is(':checked')) {
//                 svg.css('display', 'block');
//                 filterDistrictChangeEvent = true;
//             } else {
//                 svg.css('display', 'none');
//             }
//         }

//         checkbox.change(updateCheckboxState);

//         span.click(function () {
//             checkbox.prop('checked', !checkbox.prop('checked'));
//             updateCheckboxState();
//         });
//     });
// });
$(document).ready(function () {
    function updateHeaderCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || []; // Lấy giỏ hàng từ localStorage
        let cartItems = $('#header-cart-items');
        let cartItemMobile = $('#cart-items');
        cartItems.empty(); // Dọn dẹp danh sách hiện có
        let total = 0;

        if (cart.length === 0) {
            cartItems.append('<li>Giỏ hàng trống</li>');
            cartItemMobile.append('<li>Giỏ hàng trống</li>');
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
                         <button class="remove-item btn btn-outline-secondary btn-sm" data-index="${index}">Xóa</button>
                    </li>
                `);
                cartItemMobile.append(`
                    <li class="d-flex justify-content-between mb-3">
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
                         <button class="remove-item btn btn-outline-secondary btn-sm" data-index="${index}">Xóa</button>
                    </li>
                `);
            });
        }
        $('#header-cart-total').text(formatVND(total));
        $('#cart-total').text(formatVND(total));
    }

    // Cập nhật giỏ hàng ngay khi tải trang
    updateHeaderCart();
    
    $(document).on('click', '.remove-item', function () {
        let index = $(this).data('index'); // Lấy chỉ số sản phẩm cần xóa
        let cart = JSON.parse(localStorage.getItem('cart')) || []; // Lấy giỏ hàng từ localStorage
    
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1); // Xóa sản phẩm theo chỉ số
            localStorage.setItem('cart', JSON.stringify(cart)); // Cập nhật lại localStorage
            updateHeaderCart(); // Cập nhật lại giao diện giỏ hàng
        }
    });
    
});
