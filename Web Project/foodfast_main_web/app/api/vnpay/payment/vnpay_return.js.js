// file: pages/payment/vnpay_return.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function VnpayReturnPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('Đang kiểm tra kết quả giao dịch...');

  useEffect(() => {
    if (router.isReady && Object.keys(router.query).length > 0) {
      // Lấy toàn bộ tham số VNPAY trả về từ URL
      const vnpParams = router.query; 

      // Gửi các tham số này đến API Back-end để xác thực và lấy kết quả
      const checkStatus = async () => {
        try {
          // GỌI API ROUTE BẠN VỪA TẠO
          const response = await axios.get('/api/vnpay/return', { params: vnpParams });
          
          const { code, message, orderId, amount } = response.data;

          if (code === '00') {
            setStatusMessage(`Thanh toán thành công! Mã đơn hàng: **${orderId}**. Số tiền: **${amount.toLocaleString('vi-VN')} VND**.`);
          } else {
            setStatusMessage(`Thanh toán thất bại. Mã lỗi: **${code}**. Lời nhắn: **${message}**.`);
          }
        } catch (error) {
          setStatusMessage('Lỗi hệ thống khi kiểm tra kết quả.');
        }
      };
      
      checkStatus();
    }
  }, [router.isReady, router.query]);

  return (
    <div>
      <h1>Trạng thái Thanh toán VNPAY</h1>
      <p style={{ fontWeight: 'bold' }}>{statusMessage}</p>
      {/* Về giỏ hàng trống + Thêm vào lịch sử đơn hàng */}
    </div>
  );
}

export default VnpayReturnPage;