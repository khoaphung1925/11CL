const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/save-order', (req, res) => {
    const orderDetails = req.body;
    const filePath = './sao_ke.xlsx';

    let workbook;
    try {
        workbook = XLSX.readFile(filePath);
    } catch (e) {
        workbook = XLSX.utils.book_new();
    }

    const sheetName = "Đơn Hàng";
    let ws;

    if (workbook.SheetNames.includes(sheetName)) {
        ws = workbook.Sheets[sheetName];
        XLSX.utils.sheet_add_json(ws, [orderDetails], { skipHeader: true, origin: -1 });
    } else {
        ws = XLSX.utils.json_to_sheet([orderDetails], { header: Object.keys(orderDetails) });
        XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    }

    try {
        XLSX.writeFile(workbook, filePath);
        res.send({ message: 'Đơn hàng đã được lưu thành công' });
    } catch (error) {
        console.error('Lỗi khi ghi file:', error);
        res.status(500).send({ message: 'Có lỗi xảy ra khi lưu đơn hàng: ' + error.message });
    }
});
app.post('/api/change-payment-status', (req, res) => {
    const { code } = req.body;

    try {
        let workbook = XLSX.readFile('./sao_ke.xlsx');
        let ws = workbook.Sheets[workbook.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json(ws);

        let order = data.find(row => row.code === code);
        if (order) {
            // Thay đổi trạng thái thanh toán
            order.paymentStatus = (order.paymentStatus === "Đã Thanh Toán") ? "Chưa Thanh Toán" : "Đã Thanh Toán";

            // Cập nhật lại sheet và ghi file
            let newWs = XLSX.utils.json_to_sheet(data);
            workbook.Sheets[workbook.SheetNames[0]] = newWs;
            XLSX.writeFile(workbook, './sao_ke.xlsx');
            res.send({ message: 'Trạng thái thanh toán đã được cập nhật.' });
        } else {
            res.status(404).send({ message: 'Không tìm thấy đơn hàng với mã này.' });
        }
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).send({ message: 'Lỗi khi cập nhật trạng thái thanh toán' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});

app.use((req, res, next) => {
    res.status(404).send('Không tìm thấy trang yêu cầu');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Có lỗi từ phía server');
});
