$(document).ready(function () {
    let currentPage = 1;
    const postsPerPage = 6;

    fetchBlogs(currentPage);

    function fetchBlogs(page) {
        $.ajax({
            url: `/api/blogs?limit=${postsPerPage}&page=${page}`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.blogs && response.totalPages) {
                    appendBlogs(response.blogs, true);
                    createPagination(response.totalPages, page);
                }
            },
            error: function (error) {
                console.error("Error fetching blogs:", error);
            }
        });
    }

    function appendBlogs(blogs, empty = false) {
        const container = $('#blogs-container');
        if (empty) {
            container.empty();
        }
        blogs.forEach(function (blog) {
            const blogHtml = `
                <div class="col-md-6 col-sm-12">
                        <div class="blog grid-blog">
                            <div class="blog-image">
                                <a href="/blog/${blog.slug}">
                                    <img class="img-fluid" src="${blog.thumbnail}" alt="Post Image">
                                </a>
                            </div>
                            <div class="blog-grid-box">
                                <div class="blog-info clearfix">
                                    <div class="post-left">
                                        <ul>
                                            <li>
                                                <img class="img-fluid" src="assets/img/icon/icon-22.svg" alt="Img">
                                                ${blog.date}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <h3 class="blog-title">
                                    <a href="/blog/${blog.slug}">${blog.title}</a>
                                </h3>
                                <div class="blog-content blog-read">
                                    <p>${blog.short_content}</p>
                                    <a href="/blog/${blog.slug}" class="read-more btn btn-primary">Đọc Thêm</a>
                                </div>
                            </div>
                        </div>
                    </div>
            `;
            container.append(blogHtml);
        });
        if ($('.owl-carousel.product-img').length > 0) {
            const owl = $('.owl-carousel.product-img');
            owl.owlCarousel({
                margin: 0,
                nav: true,
                loop: true,
                responsive: {
                    0: {
                        items: 1
                    }
                }
            });
        }
    }
    function createPagination(totalPages, currentPage) {
        const paginationContainer = $('.pagination.lms-page');
        paginationContainer.empty(); 

        paginationContainer.append(`
            <li class="page-item prev ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${currentPage - 1}">
                    <svg viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </a>
            </li>
        `);

        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0);" data-page="${i}">${i}</a>
                </li>
            `);
        }

        paginationContainer.append(`
            <li class="page-item next ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0);" data-page="${currentPage + 1}">
                    <svg viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
                </a>
            </li>
        `);

        paginationContainer.find('a').on('click', function () {
            const newPage = $(this).data('page');
            if (newPage > 0 && newPage <= totalPages) {
                currentPage = newPage;
                fetchBlogs(currentPage);
            }
        });
    }
});

//blogs-detail

$(document).ready(function () {
    let currentPage = 1;
    const postsPerPage = 8;
    
    setupSocialShare();
    fetchBlogDetail();
    
    function fetchBlogDetail() {
        $.ajax({
            url: `/api/blogs?limit=${postsPerPage}&page=${currentPage}`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.blogs && Array.isArray(response.blogs)) {
                    appendBlogDetail(response.blogs, true);
                } else {
                    console.error("Dữ liệu blogs không hợp lệ:", response);
                }
            },
            error: function (error) {
                console.error("Error fetching blogs:", error);
            }
        });
    }
    
    function appendBlogDetail(blogs, empty = false) {
        const container = $('#blogs-related');
        if (empty) {
            container.empty();
        }
        blogs.forEach(function (blog) {
            const blogDetailHtml = `
                <div class="col-md-6 col-sm-12">
                        <div class="blog grid-blog">
                            <div class="blog-image">
                                <a href="/blog/${blog.slug}">
                                    <img class="img-fluid" src="${blog.thumbnail}" alt="Post Image">
                                </a>
                            </div>
                            <div class="blog-detail-grid-box">
                                <h3 class="blog-detail-title mt-2">
                                    <a href="/blog/${blog.slug}">${blog.title}</a>
                                </h3>
                                <span class="blog-detail-date">${blog.date}</span>
                            </div>
                        </div>
                    </div>
            `;
            container.append(blogDetailHtml);
        });
        if ($('.owl-carousel.product-img').length > 0) {
            const owl = $('.owl-carousel.product-img');
            owl.owlCarousel({
                margin: 0,
                nav: true,
                loop: true,
                responsive: {
                    0: {
                        items: 1
                    }
                }
            });
        }
    }
    
    function setupSocialShare(){
        var currentUrl = encodeURIComponent(window.location.href);
        $("#facebook-share").attr("href", `https://www.facebook.com/sharer.php?u=${currentUrl}`);
        $("#twitter-share").attr(
            "href",
            `https://twitter.com/intent/tweet?url=${currentUrl}`
        );
        $("#email-share").attr(
            "href",
            `mailto:?subject=Check this out!&body=Check out this amazing content: ${decodeURIComponent(currentUrl)}`
        );
    }
    
    
});

