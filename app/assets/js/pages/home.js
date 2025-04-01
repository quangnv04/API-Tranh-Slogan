const productsContainer = $('#products-container');
const cardTemplateContent = $('#card-template')[0].content;

for (let i = 0; i < 12; i++) {
    productsContainer.append($(cardTemplateContent.cloneNode(true)));
}

let page = 1;
const limit = 20;
let totalPages = 1;

$(document).ready(function () {
    let canFetch = true;

    $(window).scroll(function () {
        if (nearBottom() && canFetch) {
            fetchProducts();
        }
    });
    const endTimeString = $('.countdown').attr('data-end');
    const formattedTime = convertToISOFormat(endTimeString);
    const saleEndTime = new Date(formattedTime).getTime();
    startCountdown(saleEndTime);

    function convertToISOFormat(dateString) {
        const parts = dateString.split(' '); // Tách ngày và giờ
        const dateParts = parts[0].split('-'); // Tách DD-MM-YYYY
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${parts[1]}`; // YYYY/MM/DD HH:MM:SS
    }
    function startCountdown(endTime) {
        function updateCountdown() {
            const now = new Date().getTime();
            const timeLeft = endTime - now;
            if (timeLeft <= 0) {
                $('.countdown').html("<h2>Flash Sale Ended!</h2>");
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            $('#days').text(String(days).padStart(2, '0'));
            $('#hours').text(String(hours).padStart(2, '0'));
            $('#minutes').text(String(minutes).padStart(2, '0'));
            $('#seconds').text(String(seconds).padStart(2, '0'));

            $('.countdown span').addClass('animate');
            setTimeout(() => $('.countdown span').removeClass('animate'), 200);

            if (timeLeft <= 60000) {
                $('.countdown').addClass('flash');
            }
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    function nearBottom() {
        return $(window).scrollTop() > $(document).height() * 0.8 - $(window).height();
    }

    function fetchProducts(pageNum = page) {
        canFetch = false;
        $.ajax({
            url: `/api/products?page=${pageNum}&limit=${limit}`,
            type: 'GET',
            dataType: 'json',
            success: data => {
                if (data && typeof data === 'object' && data.products && data.products.length > 0) {
                    appendProducts(keysToCamelCase(data.products));
                    createPagination(data.totalPages, pageNum);
                    currentPage = pageNum;
                } else {
                    createPagination(1, 1);
                }
                canFetch = data.length === limit;
            },
            error: error => {
                console.error("Error fetching products:", error);
                canFetch = true;
            }
        });
    }

    function appendProducts(products, empty = true) {
        const container = $('#products-container');
        if (empty) {
            container.empty();
        }
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
        if ($('.swiper-container.product-img').length > 0) {
            new Swiper('.swiper-container.product-img', {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                navigation: {
                    nextEl: '.custom-button-next',
                    prevEl: '.custom-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                }
            });
        }
        // var swiper = new Swiper(".swiper", {
        //     slidesPerView: 1,  // Hiển thị 1 banner mỗi slide
        //     spaceBetween: 10,  // Khoảng cách giữa các slide
        //     loop: true,        // Lặp vô hạn
        //     autoplay: {
        //         delay: 3000,    // Tự động chạy sau 3 giây
        //         disableOnInteraction: false // Không dừng khi tương tác
        //     },
        //     pagination: {
        //         el: ".swiper-pagination",
        //         clickable: true,
        //     },
        //     navigation: {
        //         nextEl: ".swiper-button-next",
        //         prevEl: ".swiper-button-prev",
        //     },
        // });
        $(".swiper").each(function () {
            const swiperEl = this; // Lưu phần tử DOM của Swiper
            const $swiper = $(swiperEl); // Chuyển thành jQuery object

            let slides = $(this).data("slides") || 4; // Số lượng slide mặc định là 4
            let breakpointsAttr = $(this).attr("data-breakpoints");
            let breakpoints = breakpointsAttr ? JSON.parse(breakpointsAttr) : {}; // Kiểm tra nếu có breakpoints thì parse JSON, nếu không thì để trống {}

            new Swiper(this, {
                loop: true,              // Lặp vô hạn
                slidesPerView: slides,
                spaceBetween: 10,
                navigation: {
                    nextEl: $swiper.find(".swiper-button-next")[0],
                    prevEl: $swiper.find(".swiper-button-prev")[0],
                },
                pagination: {
                    el: $swiper.find('.swiper-pagination')[0],
                    clickable: true,
                },
                autoplay: {
                    delay: 3000,         // Tự động chuyển slide sau 3 giây
                    disableOnInteraction: false,
                },
                breakpoints: Object.keys(breakpoints).length ? breakpoints : undefined, // Chỉ thêm breakpoints nếu có dữ liệu
            });
        });
    }

    function createPagination(totalPages, currentPage) {
        const paginationContainer = $('.pagination.lms-page');
        paginationContainer.empty();

        if (totalPages <= 1) {
            return;
        }

        paginationContainer.append(`
            <li class="page-item prev ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" data-page="${currentPage - 1}">
                    <svg viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </a>
            </li>
        `);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        if (startPage > 1) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" data-page="1">1</a>
                </li>
            `);

            if (startPage > 2) {
                paginationContainer.append(`
                    <li class="page-item disabled">
                        <a class="page-link" href="javascript:void(0)">...</a>
                    </li>
                `);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a>
                </li>
            `);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationContainer.append(`
                    <li class="page-item disabled">
                        <a class="page-link" href="javascript:void(0)">...</a>
                    </li>
                `);
            }

            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" data-page="${totalPages}">${totalPages}</a>
                </li>
            `);
        }

        paginationContainer.append(`
            <li class="page-item next ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" data-page="${currentPage + 1}">
                    <svg viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                </a>
            </li>
        `);

        paginationContainer.off('click', 'a.page-link');

        paginationContainer.on('click', 'a.page-link', function (event) {
            event.preventDefault();
            const newPage = parseInt($(this).data('page'));

            if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
                window.scrollTo(0, 0);
                fetchProducts(newPage);
            }
        });
    }

    fetchProducts(page);
});
