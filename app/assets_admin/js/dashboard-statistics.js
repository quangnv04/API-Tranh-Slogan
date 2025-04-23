let chartInstance = null;
let currentTab = "price"; // 'price' | 'count' | 'combine'

function getEndpoint(type) {
  return type === "count"
    ? "/api/admin/statistics/order_count"
    : "/api/admin/statistics/revenue";
}
// Hàm gọi API dữ liệu
function fetchChartData(dataType, type, startDate, endDate) {
  const url = getEndpoint(dataType);

  return $.ajax({
    url: url,
    method: "GET",
    data: { type, startDate, endDate },
  });
}

// Hàm vẽ biểu đồ
function drawChart(data, dataType) {
  if (!data.length) {
    return;
  }

  const timeField = Object.keys(data[0]).find((k) =>
    k.toLowerCase().includes("order")
  );
  const labels = data.map((item) => item[timeField]);

  const valuesPrice = data.map((item) => item.total_price || 0);
  const valuesCount = data.map((item) => item.total_count || 0);

  const ctx = document.getElementById("chart-line").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  const datasets = [];
  const yAxes = {};

  const isCombine = dataType === "combine";
  const onlyPrice = dataType === "price";
  const onlyCount = dataType === "count";

  if (onlyPrice || isCombine) {
    datasets.push({
      label: "Doanh thu (VNĐ)",
      data: valuesPrice,
      borderColor: "#4bc0c0",
      backgroundColor: "rgba(75,192,192,0.2)",
      yAxisID: "yPrice",
      tension: 0.4,
      fill: true,
    });

    yAxes.yPrice = {
      type: "linear",
      position: isCombine ? "left" : "left", // combine thì luôn ở trái, riêng cũng trái
      title: {
        display: true,
        text: "Doanh thu (VNĐ)",
      },
      beginAtZero: true,
    };
  }

  if (onlyCount || isCombine) {
    datasets.push({
      label: "Số đơn hàng",
      data: valuesCount,
      borderColor: "#f39c12",
      backgroundColor: "rgba(243,156,18,0.2)",
      yAxisID: "yCount",
      tension: 0.4,
      fill: true,
    });

    yAxes.yCount = {
      type: "linear",
      position: isCombine ? "right" : "left", // nếu không phải combine thì cũng để bên trái
      title: {
        display: true,
        text: "Số đơn hàng",
      },
      beginAtZero: true,
      grid: {
        drawOnChartArea: !isCombine, // ẩn grid nếu là combine
      },
    };
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Thời gian",
          },
        },
        ...yAxes,
      },
    },
  });
}

// Hàm tải và kết hợp dữ liệu nếu cần
function reloadChart() {
  const type = $("#typeSelect").val();
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();

  if (currentTab === "combine") {
    // Gọi song song 2 API
    Promise.all([
      fetchChartData("price", type, startDate, endDate),
      fetchChartData("count", type, startDate, endDate),
    ])
      .then(([priceData, countData]) => {
        // Kết hợp theo thứ tự (đảm bảo trả về cùng key thời gian)
        const mergedData = priceData.map((item, index) => ({
          ...item,
          total_count: countData[index]?.total_count || 0,
        }));
        drawChart(mergedData, "combine");
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu kết hợp:", error);
        alert("Lỗi khi tải dữ liệu kết hợp");
      });
  } else {
    fetchChartData(currentTab, type, startDate, endDate)
      .then((data) => drawChart(data, currentTab))
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
        alert("Lỗi khi tải dữ liệu");
      });
  }
}
function fortamtPercent(val) {
  if (val == 0) return { className: "text-primary", text: val + "%" };
  if (val > 0) return { className: "text-success", text: "+" + val + "%" };
  else return { className: "text-danger", text: val + "%" };
}
// Xử lý khi nhấn nút hoặc chuyển tab
$(document).ready(() => {
  reloadChart();

  // Sự kiện nút "Xem"
  $("#btnView").click(() => {
    reloadChart();
  });

  // Sự kiện chuyển tab
  $("#chartTab .nav-link").on("click", function () {
    currentTab = $(this).data("type");
    reloadChart();
  });

  setTimeout(() => {
    $.ajax({
      url: "/api/admin/statistics/monthly_revenue_and_order_count",
      method: "GET",
      success: function (response) {
        let percentRevenue = fortamtPercent(response.revenue_percent_change);
        let percentOrder = fortamtPercent(response.order_count_percent_change);

        $(".doanh_thu_hom_nay").empty().append(`
                    <p class="text-sm mb-0 text-uppercase font-weight-bold ">Doanh thu tháng này</p>
                    <h5 class="font-weight-bolder">
                        ${response.current_month_revenue.toLocaleString(
                          "vi-VN",
                          {
                            style: "currency",
                            currency: "VND",
                          }
                        )}
                    </h5>
                   <p class="mb-0 ">
                    <span class="${
                      percentRevenue.className
                    } text-sm font-weight-bolder ">${percentRevenue.text}</span>
                    since last month
                    </p>
                `);

        $(".so_don_hang_hom_nay").empty().append(`
                    <p class="text-sm mb-0 text-uppercase font-weight-bold ">Số đơn hàng tháng này</p>
                    <h5 class="font-weight-bolder">
                        ${response.current_month_order_count}
                    </h5>
                     <p class="mb-0">
                    <span class="${percentOrder.className} text-sm font-weight-bolder">${percentOrder.text}</span>
                     since last month
                     </p>
                `);
      },
      error: function (err) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", err);
      },
    });
  }, 1000); // 🔁 Lặp lại mỗi 5 giây
});
