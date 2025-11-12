# SGU2025_CNPM_NHOM15

**Học phần:** Công nghệ phần mềm

**Giảng viên:** TS.Nguyễn Quốc Huy

**Lớp:** DCT122C3 

**Nhóm:** 15

**Thành viên:**

- Châu Gia Anh - 3122411002
- Dương Lê khánh - 3122411093

**Đề tài:** 1/FE DEV (React Native + React.JS) chuyên nghiệp xử lý giao diện đặt hàng (trên Web, Mobile)

## FoodFast Drone Delivery
### Giới thiệu

FoodFast Drone Delivery là hệ thống giao đồ ăn nhanh bằng drone, mang đến trải nghiệm giao hàng hiện đại và tiện lợi.
Người dùng có thể đặt món ăn từ các cửa hàng đối tác, thanh toán trực tuyến qua QR code, và nhận đồ ăn trực tiếp từ drone tại vị trí của mình.

### 1. Narrative (Luồng hoạt động chuẩn)

1.1. Khởi tạo đơn hàng

| Bước | Mô tả Hoạt động | Hệ thống/Thành phần liên quan |
| :--- | :--- | :--- |
| **1.** | Khách hàng đặt hàng (Chọn món, nhập địa chỉ giao hàng). | Customer App/Web |
| **2.** | OMS Kiểm tra điều kiện sơ bộ: **Eligibility Check** (Vùng giao hàng hợp lệ, Tải trọng đơn hàng giới hạn của drone khả dụng, ETA dự kiến). | OMS (Order Management System) |
| **3.** | Nếu điều kiện đạt, hệ thống yêu cầu Khách hàng **thanh toán**. | Payment Service, Customer App/Web |
| **4.** | **Thanh toán thành công**. OMS chuyển trạng thái đơn hàng sang "Chờ chuẩn bị". | Payment Service, OMS |

---

1.2. Chuẩn bị và Cất cánh

| Bước | Mô tả Hoạt động | Hệ thống/Thành phần liên quan |
| :--- | :--- | :--- |
| **5.** | **Hiển thị QR Code Đơn hàng** nhận hàng (dùng để xác nhận cuối cùng). | Customer App/Web |
| **6.** | **Thông báo Nhà hàng**. OMS gửi thông báo và chi tiết đơn hàng đến Merchant Interface. | Merchant Interface |
| **7.** | **Gửi Drone đến Nhà hàng**. OMS tạo **Flight Request** và gửi đến GCS. GCS điều phối drone khả dụng gần nhất bay đến vị trí Nhà hàng. | OMS, GCS (Ground Control Station) |
| **8.** | **Bàn giao tại Nhà hàng**. Merchant đóng gói và sử dụng **QR Code/Bar-code** của đơn hàng để mở khoá khoang drone và khóa gói hàng vào. | Merchant Interface, Drone (khóa thông minh) |
| **9.** | **Kiểm tra tại Nhà hàng**. Drone/OMS thực hiện kiểm tra cuối cùng (Tải trọng gói hàng có vượt quá giới hạn sau khi đặt vào không). | Drone Sensors, OMS |

---

1.3. Vận chuyển và Giao nhận

| Bước | Mô tả Hoạt động | Hệ thống/Thành phần liên quan |
| :--- | :--- | :--- |
| **10.** | **Vận chuyển (Ship)**. Drone cất cánh từ điểm Merchant và bay theo lộ trình tối ưu đến Khách hàng. | GCS, Drone |
| **11.** | **Giám sát Vận chuyển**. GCS truyền **toạ độ real-time** của drone. Thông tin này được hiển thị xuyên suốt trên 3 giao diện (Admin, Customer, Merchant) cùng với các thông báo trạng thái. | GCS, Admin Dashboard, Customer/Merchant App |
| **12.** | **Giao nhận bằng QR Code**. Tới điểm thả, drone hạ hàng bằng dây tời. Khách hàng dùng **QR Code** (từ bước 5) để xác nhận và mở khóa gói hàng. | Customer App/Web, Drone (khóa thông minh) |
| **13a.** | **Giao nhận thành công**. Khách hàng mở đơn thành công. OMS ghi nhận đơn hàng hoàn tất. | OMS |
| **13b.** | **Giao nhận không thành công** (chờ 10 phút, không có thao tác,...): OMS/GCS kích hoạt quy trình sự cố: Drone thu hồi hàng/bay về (Return-to-Merchant hoặc hạ cánh khẩn cấp). | OMS, GCS, Drone |
| **14.** | **Thông báo Hoàn tất**. OMS gửi thông báo trạng thái cuối cùng ("Đơn hàng thành công" / "Đơn hàng không thành công") tới 3 bên. | OMS, Admin/Customer/Merchant App |
| **15.** | **Drone bay về**. GCS điều phối Drone bay về điểm sạc/khu vực chờ gần nhất. | GCS |

---

### 2. Sơ đồ nghiệp vụ

<img width="657" height="330" alt="image" src="https://github.com/user-attachments/assets/742bb544-f7ad-4b8b-b51a-81b80b7c841f" />
<img width="657" height="238" alt="image" src="https://github.com/user-attachments/assets/e7a707bf-5f30-4333-8b9f-6a0f55e847a2" />
<img width="656" height="353" alt="image" src="https://github.com/user-attachments/assets/95c0a020-d818-416b-8c33-f56868c89a9e" />

### 3. Solution Alignment

<img width="656" height="266" alt="image" src="https://github.com/user-attachments/assets/7f94d727-4067-4f1b-8964-fba391ae5c1f" />

### 4. Use Case Diagram

<img width="501" height="909" alt="image" src="https://github.com/user-attachments/assets/dc19205e-125b-43ce-b777-8a3b1444d01c" />







  
