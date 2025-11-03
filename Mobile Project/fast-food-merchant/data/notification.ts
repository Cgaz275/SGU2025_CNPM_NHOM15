export type NotificationType =
  | 'order'
  | 'customer'
  | 'system'
  | 'finance'
  | 'promotion';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Đơn hàng mới #A1043',
    message:
      'Khách hàng Nguyễn Văn A vừa đặt món “Bún Bò Huế Đặc Biệt”. Vui lòng xác nhận sớm.',
    time: '5 phút trước',
  },
  {
    id: 'n2',
    type: 'order',
    title: 'Đơn hàng #A1022 đã hủy',
    message:
      'Khách hàng hủy đơn do chờ lâu. Vui lòng kiểm tra lại thời gian xử lý đơn.',
    time: '20 phút trước',
  },
  {
    id: 'n3',
    type: 'customer',
    title: 'Đánh giá mới 5⭐',
    message: 'Khách hàng Trần B chia sẻ: “Món ăn ngon, giao nhanh!”',
    time: '1 giờ trước',
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Cập nhật chính sách giao hàng',
    message:
      'Phí giao hàng khu vực nội thành sẽ được điều chỉnh từ 10k lên 12k bắt đầu từ 5/11.',
    time: '3 giờ trước',
  },
  {
    id: 'n5',
    type: 'finance',
    title: 'Thanh toán tự động thành công',
    message:
      'Số tiền 2.345.000đ đã được chuyển vào tài khoản ngân hàng của bạn.',
    time: 'Hôm nay, 08:45',
  },
  {
    id: 'n6',
    type: 'promotion',
    title: 'Tham gia “Top Seller Tuần”',
    message: 'Tăng doanh số 10% để nhận huy hiệu và thưởng 200k từ hệ thống.',
    time: 'Hôm qua',
  },
  {
    id: 'n7',
    type: 'system',
    title: 'Bảo trì hệ thống dự kiến',
    message:
      'Máy chủ sẽ tạm ngừng từ 00:00 - 02:00 ngày 6/11 để nâng cấp hiệu năng.',
    time: '2 ngày trước',
  },
  {
    id: 'n8',
    type: 'customer',
    title: 'Khiếu nại đơn hàng #A1009',
    message:
      'Khách hàng phản ánh món bị thiếu. Vui lòng kiểm tra và phản hồi trong 24h.',
    time: '3 ngày trước',
  },
  {
    id: 'n9',
    type: 'finance',
    title: 'Đã xuất hóa đơn tháng 10',
    message: 'Tổng doanh thu: 52.350.000đ — tải báo cáo trong mục “Doanh thu”.',
    time: '4 ngày trước',
  },
  {
    id: 'n10',
    type: 'promotion',
    title: 'Chương trình ưu đãi dành riêng cho nhà hàng đối tác',
    message:
      'Giảm 15% phí dịch vụ trong tuần này khi duy trì điểm đánh giá trên 4.7⭐.',
    time: '5 ngày trước',
  },
];
