// file: pages/api/vnpay/create.js

import { Vnpay } from 'vnpay';
import dayjs from 'dayjs';

// Khởi tạo Vnpay Client
const vnpay = new Vnpay({
  tmnCode: process.env.VNPAY_TMNCODE,
  hashSecret: process.env.VNPAY_HASHSECRET,
  vnpayHost: process.env.VNPAY_URL.replace('/paymentv2/vpcpay.html', ''), // Chỉ cần host
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Lấy dữ liệu từ Front-end
  const { amount, orderId, bankCode, language } = req.body;

  try {
    // 1. Chuẩn bị các tham số bắt buộc cho VNPAY
    const vnp_Params = {
      vnp_Amount: amount * 100, // VNPAY yêu cầu số tiền là đơn vị Cents (ví dụ: 10,000 VND -> 1,000,000)
      vnp_TxnRef: orderId, // Mã đơn hàng duy nhất
      vnp_CreateDate: dayjs().format('YYYYMMDDHHmmss'),
      vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_BankCode: bankCode || '', // Mã ngân hàng, để trống nếu muốn người dùng tự chọn
      vnp_Locale: language || 'vn',
      vnp_Command: 'pay',
      vnp_OrderType: 'other',
    };

    // 2. Sử dụng thư viện Vnpay để tạo URL thanh toán
    const paymentUrl = vnpay.buildPaymentUrl(vnp_Params);

    // 3. Trả về URL cho Front-end
    return res.status(200).json({ paymentUrl });
  } catch (error) {
    console.error('Error generating VNPAY URL:', error);
    return res.status(500).json({ message: 'Error generating VNPAY payment URL' });
  }
}