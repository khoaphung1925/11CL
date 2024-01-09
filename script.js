// script.js (updated)
let fourDigitCode; // Biến toàn cục lưu trữ mã số 4 chữ số

document.addEventListener("DOMContentLoaded", function() {
    // Hàm để tạo các option với tên và giá đã định
    function addOptions(selectElement, options) {
        // Thêm option "None"
        let noneOption = document.createElement("option");
        noneOption.value = 0;
        noneOption.textContent = "None";
        selectElement.appendChild(noneOption);

        // Thêm các options khác
        for (let i = 0; i < options.length; i++) {
            let option = document.createElement("option");
            option.value = options[i].price;
            option.textContent = `${options[i].name} (${options[i].price} đồng)`;
            selectElement.appendChild(option);
        }
    }

    // Danh sách các tùy chọn cho món
    let monOptions = [
        { name: "Món 1", price: 15000 },
        { name: "Món 2", price: 20000 },
        { name: "Món 3", price: 25000 },
        // Thêm các tùy chọn khác cho món
    ];

    // Danh sách các tùy chọn cho size
    let sizeOptions = [
        { name: "Size 1", price: 10000 },
        { name: "Size 2", price: 12000 },
        { name: "Size 3", price: 15000 },
        // Thêm các tùy chọn khác cho size
    ];

    // Danh sách các tùy chọn cho topping1
    let topping1Options = [
        { name: "Topping 1.1", price: 5000 },
        { name: "Topping 1.2", price: 6000 },
        { name: "Topping 1.3", price: 8000 },
        // Thêm các tùy chọn khác cho topping1
    ];

    // Danh sách các tùy chọn cho topping2
    let topping2Options = [
        { name: "Topping 2.1", price: 7000 },
        { name: "Topping 2.2", price: 9000 },
        { name: "Topping 2.3", price: 10000 },
        // Thêm các tùy chọn khác cho topping2
    ];

    // Danh sách các tùy chọn cho topping3
    let topping3Options = [
        { name: "Topping 3.1", price: 8000 },
        { name: "Topping 3.2", price: 10000 },
        { name: "Topping 3.3", price: 12000 },
        // Thêm các tùy chọn khác cho topping3
    ];

    // Thêm options vào mỗi select
    addOptions(document.getElementById("mon"), monOptions);
    addOptions(document.getElementById("size"), sizeOptions);
    addOptions(document.getElementById("topping1"), topping1Options);
    addOptions(document.getElementById("topping2"), topping2Options);
    addOptions(document.getElementById("topping3"), topping3Options);

    // Hàm tính toán tổng tiền
    window.calculateTotal = function() {
        let total = 0;
        total += parseInt(document.getElementById("mon").value);
        total += parseInt(document.getElementById("size").value);
        total += parseInt(document.getElementById("topping1").value);
        total += parseInt(document.getElementById("topping2").value);
        total += parseInt(document.getElementById("topping3").value);
        document.getElementById("total").value = total + ' đồng';
    }
});
function encryptContentToFourDigits(content) {
    let sum = 0;
    for (let i = 0; i < content.length; i++) {
        sum += content.charCodeAt(i);
    }
    return ('0000' + (sum % 10000)).slice(-4);
}

function generateFourDigitValue() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQRCode(orderDetails) {
    let orderString = `${orderDetails.code}`;

    QRCode.toDataURL(orderString, { errorCorrectionLevel: 'H' })
        .then(url => {
            document.getElementById("qrCodeImage").src = url;
        })
        .catch(err => {
            console.error(err);
        });
}
function handlePlaceOrder() {
    if (!fourDigitCode) {
        fourDigitCode = generateFourDigitValue();
    }

    let orderDetails = {
        code: fourDigitCode,
        customerName: document.getElementById("customerName").value,
        paymentStatus: document.getElementById("paymentStatus").checked ? "Đã Thanh Toán" : "Chưa Thanh Toán",
        mon: document.getElementById("mon").selectedOptions[0].textContent,
        size: document.getElementById("size").selectedOptions[0].textContent,
        topping1: document.getElementById("topping1").selectedOptions[0].textContent,
        topping2: document.getElementById("topping2").selectedOptions[0].textContent,
        topping3: document.getElementById("topping3").selectedOptions[0].textContent,
        total: document.getElementById("total").value
    };

    generateQRCode(orderDetails);
}


function downloadQRCode() {
    var qrImage = document.getElementById("qrCodeImage").src;
    var link = document.createElement("a");

    link.href = qrImage;
    link.download = "QRCode.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}





document.getElementById("saveButton").addEventListener("click", function() {
    if (!fourDigitCode) {
        fourDigitCode = generateFourDigitValue();
    }

    let orderDetails = {
        code: fourDigitCode,
        mon: document.getElementById("mon").selectedOptions[0].textContent,
        customerName: document.getElementById("customerName").value,
        paymentStatus: document.getElementById("paymentStatus").checked ? "Đã Thanh Toán" : "Chưa Thanh Toán",
        size: document.getElementById("size").selectedOptions[0].textContent,
        topping1: document.getElementById("topping1").selectedOptions[0].textContent,
        topping2: document.getElementById("topping2").selectedOptions[0].textContent,
        topping3: document.getElementById("topping3").selectedOptions[0].textContent,
        total: document.getElementById("total").value
    };


    generateQRCode(orderDetails);

    fetch('http://localhost:3000/api/save-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderDetails)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Máy chủ gặp lỗi khi xử lý yêu cầu');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Lỗi khi gửi đơn hàng:', error);
        alert('Có lỗi xảy ra khi gửi đơn hàng');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("orderSearchForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const orderCode = document.getElementById("orderCode").value;
        fetch(`/api/find-order?code=${orderCode}`)
            .then(response => response.json())
            .then(data => {
                if (data.order) {
                    // Hiển thị thông tin đơn hàng
                    document.getElementById("orderDetails").textContent = JSON.stringify(data.order, null, 2);
                } else {
                    document.getElementById("orderDetails").textContent = "Không tìm thấy đơn hàng.";
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById("orderDetails").textContent = "Lỗi khi tìm kiếm đơn hàng.";
            });
    });
});


