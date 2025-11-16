// file: pages/api/vnpay/return.js

import { Vnpay } from 'vnpay';

// Khởi tạo Vnpay Client
const vnpay = new Vnpay({
  tmnCode: process.env.VNPAY_TMNCODE,
  hashSecret: process.env.VNPAY_HASHSECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // VNPAY trả về kết quả qua query string
  const vnp_Params = req.query;

  try {
    // 1. Sử dụng thư viện Vnpay để xác thực chữ ký (Checksum)
    const isSuccess = vnpay.verifyIpnCall(vnp_Params);
    
    if (isSuccess) {
      // 2. Xác thực thành công: Kiểm tra mã kết quả
      const vnp_ResponseCode = vnp_Params.vnp_ResponseCode;
      const vnp_TxnRef = vnp_Params.vnp_TxnRef; // Mã đơn hàng của bạn
      const vnp_Amount = vnp_Params.vnp_Amount / 100; // Số tiền (đã chuyển về đơn vị VND)

      if (vnp_ResponseCode === '00') {
        // **Thanh toán THÀNH CÔNG**
        
        // ************************************************************
        // BƯỚC QUAN TRỌNG: Cập nhật trạng thái đơn hàng vào CSDL của bạn
        // ************************************************************
        
        // Ví dụ: await db.updateOrderStatus(vnp_TxnRef, 'Success', vnp_Amount);

        return res.status(200).json({ 
            code: '00', 
            message: 'Thanh toán thành công', 
            orderId: vnp_TxnRef,
            amount: vnp_Amount
        });
      } else {
        // **Thanh toán THẤT BẠI** (Hoàn tác, Hết hạn, Lỗi Ngân hàng, ...)
        
        // ************************************************************
        // BƯỚC QUAN TRỌNG: Cập nhật trạng thái đơn hàng 
        // ************************************************************
        
        return res.status(200).json({ 
            code: vnp_ResponseCode, 
            message: 'Thanh toán thất bại hoặc bị hủy',
            orderId: vnp_TxnRef
        });
      }

    } else {
      // 3. Xác thực thất bại (Chữ ký không hợp lệ)
      return res.status(200).json({ code: '97', message: 'Chữ ký không hợp lệ (Sai Hash Secret)' });
    }

  } catch (error) {
    console.error('Error processing VNPAY return:', error);
    return res.status(500).json({ code: '99', message: 'Lỗi hệ thống' });
  }
}