document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const orderCode = document.getElementById('orderCode').value;
    searchOrder(orderCode);
});

async function searchOrder(code) {
    const workbook = XLSX.read(await (await fetch("./my_project/sao_ke.xlsx")).arrayBuffer());
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Lấy sheet đầu tiên
    const data = XLSX.utils.sheet_to_json(sheet);




    const order = data.find(row => row.code == code); // Tìm đơn hàng theo code
    if (!order) {
        document.getElementById('orderDetails').innerText = 'Không tìm thấy đơn hàng.';
        document.getElementById('changePaymentStatus').style.display = 'none';
    }
    if (order) {
        displayOrderDetails(order);
    } else {
        document.getElementById('orderDetails').innerText = 'Không tìm thấy đơn hàng.';
    }
}
function displayOrderDetails(order) {
    let details = `<h3>Thông Tin Đơn Hàng</h3>`;
    
    details += `<table border="1">`; // Bắt đầu tạo bảng
    details += `<tr><th>Mục</th><th>Thông tin</th></tr>`; // Tiêu đề bảng
    details += `<tr><td>Mã Đơn Hàng</td><td>${order.code}</td></tr>`;
    details += `<tr><td>Món</td><td>${order.mon}</td></tr>`;
    details += `<tr><td>Tên Khách Hàng</td><td>${order.customerName}</td></tr>`;
    details += `<tr><td>Trạng Thái Thanh Toán</td><td>${order.paymentStatus}</td></tr>`;
    details += `<tr><td>Size</td><td>${order.size}</td></tr>`;
    details += `<tr><td>Topping 1</td><td>${order.topping1}</td></tr>`;
    details += `<tr><td>Topping 2</td><td>${order.topping2}</td></tr>`;
    details += `<tr><td>Topping 3</td><td>${order.topping3}</td></tr>`;
    details += `<tr><td>Tổng Cộng</td><td>${order.total}</td></tr>`;
    details += `</table>`; // Kết thúc bảng

    document.getElementById('orderDetails').innerHTML = details;
    const changePaymentStatusButton = document.getElementById('changePaymentStatus');
    changePaymentStatusButton.style.display = 'block';
    changePaymentStatusButton.onclick = function() {
        changePaymentStatus(order.code);
    };
}let currentOrder = null; // Biến toàn cục lưu trữ đơn hàng hiện tại

function changePaymentStatus(code) {
    fetch('http://localhost:3000/api/change-payment-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi khi gửi yêu cầu');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);

        if (currentOrder && currentOrder.code === code) {
            // Đảo ngược trạng thái thanh toán và hiển thị lại
            currentOrder.paymentStatus = (currentOrder.paymentStatus === "Đã Thanh Toán") ? "Chưa Thanh Toán" : "Đã Thanh Toán";
            displayOrderDetails(currentOrder);
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi thay đổi trạng thái thanh toán');
    });
}
