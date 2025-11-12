# SGU2025_CNPM_NHOM15

**Học phần:** Công nghệ phần mềm

**Giảng viên:** TS.Nguyễn Quốc Huy

**Lớp:** DCT122C3 

**Nhóm:** 15

**Thành viên:**

- Châu Gia Anh - 3122411002
- Dương Lê khánh - 3122411093

**Đề tài:** 1/FE DEV (React Native + React.JS) chuyên nghiệp xử lý giao diện đặt hàng (trên Web, Mobile)

# FoodFast Drone Delivery
## Giới thiệu
<div><img width="214" height="51" alt="image" src="https://github.com/user-attachments/assets/2e7daa8d-307e-4590-a3f6-47cf94b0f2e3" />
</div>
FoodFast Drone Delivery là hệ thống giao đồ ăn nhanh bằng drone, mang đến trải nghiệm giao hàng hiện đại và tiện lợi.
Người dùng có thể đặt món ăn từ các cửa hàng đối tác, thanh toán trực tuyến qua QR code, và nhận đồ ăn trực tiếp từ drone tại vị trí của mình.

## 1. Narrative (Luồng hoạt động chuẩn)

**Nguồn tham khảo nghiệp vụ:** https://flytrex.com/

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

## 2. Sơ đồ nghiệp vụ

<img width="657" height="330" alt="image" src="https://github.com/user-attachments/assets/742bb544-f7ad-4b8b-b51a-81b80b7c841f" />
<img width="657" height="238" alt="image" src="https://github.com/user-attachments/assets/e7a707bf-5f30-4333-8b9f-6a0f55e847a2" />
<img width="656" height="353" alt="image" src="https://github.com/user-attachments/assets/95c0a020-d818-416b-8c33-f56868c89a9e" />

## 3. Solution Alignment

<img width="656" height="266" alt="image" src="https://github.com/user-attachments/assets/7f94d727-4067-4f1b-8964-fba391ae5c1f" />

## 4. Use Case Diagram

<img width="501" height="909" alt="image" src="https://github.com/user-attachments/assets/dc19205e-125b-43ce-b777-8a3b1444d01c" />

## 4. Công nghệ sử dụng

Hệ thống FoodFast được phát triển trên nền tảng JavaScript hiện đại, sử dụng các công nghệ chủ đạo:
- ReactJS: Xây dựng giao diện web cho Customer App, Merchant Interface, và Admin Dashboard – tối ưu hiệu năng, dễ mở rộng và tái sử dụng component.
- React Native: Phát triển ứng dụng mobile đa nền tảng (iOS & Android) cho khách hàng và merchant, đồng bộ trải nghiệm với web.
- NextJS: Dùng cho frontend web với khả năng server-side rendering (SSR), SEO tốt hơn và hiệu suất tải nhanh.

### Danh sách Dịch vụ Khác và Lớp Giao Diện Truy Vấn

 **Dịch vụ Bên ngoài (External Services)**

| Dịch vụ | API Tích hợp | Định nghĩa Cơ bản | Trách nhiệm đối với Hệ thống |
| :--- | :--- | :--- | :--- |
| **Gooing Map** (Map service) | `Map API` | Dịch vụ bản đồ số, cung cấp dữ liệu địa lý, hình ảnh vệ tinh và chức năng định tuyến. | Cung cấp **dữ liệu vị trí và định tuyến** cho các hoạt động đặt hàng. Nhận dữ liệu vị trí người dùng, thể hiện đường bay của drone. |
| **VNpay** (External Payment Services) | `VNpay API` | Cổng thanh toán điện tử (Payment Gateway) bên ngoài, xử lý các giao dịch tài chính online. | **Xử lý các giao dịch thanh toán** của khách hàng (thanh toán đơn hàng, hoàn tiền, xác thực thẻ). Dịch vụ Payment Services của Backend sẽ tương tác với API này. |
| **FlytBase** (External Drone Services) | `FlytBase Drone API` | Nền tảng quản lý và điều khiển Drone từ xa (Drone Fleet Management Platform) dựa trên đám mây. | **Quản lý, theo dõi và điều khiển các thiết bị Drone** vật lý (gửi lệnh bay, nhận dữ liệu telemetry, giám sát tình trạng). Dịch vụ Drone Services của Backend sẽ giao tiếp với API này. |
| **FireBase (FCM)** | `FireBase API` | Dịch vụ nhắn tin đa nền tảng (Cloud Messaging Service) dùng để gửi thông báo đẩy (Push Notifications). | Kích hoạt và **phân phối thông báo đẩy** theo thời gian thực đến các thiết bị của người dùng (Customer, Merchant). |

---

**Lớp Giao Diện Truy Vấn (Query Interface Layer)**

| Lớp Giao Diện | API Tích hợp | Định nghĩa Cơ bản | Trách nhiệm đối với Hệ thống |
| :--- | :--- | :--- | :--- |
| **GraphQL** | `Web API, Mobile App API` | Lớp runtime và ngôn ngữ truy vấn (Query Language) cho API, đóng vai trò là API Gateway thống nhất. | **Tổng hợp dữ liệu (Data Aggregation)** từ nhiều dịch vụ Backend thành một phản hồi duy nhất. Cung cấp một Schema linh hoạt, cho phép Clients chỉ truy vấn chính xác dữ liệu cần thiết. |


## 5. Giao diện cài đặt

### Mobile App
<div align="center">
  <img src="https://github.com/user-attachments/assets/1a4e0e27-7ca4-46d3-a356-8ebce9d7c831" width="200" alt="image 1"/>
  <img src="https://github.com/user-attachments/assets/ea5e981f-0007-4d21-8933-33eee15747b8" width="200" alt="image 2"/>
  <img src="https://github.com/user-attachments/assets/dba9a114-bcd1-4d0b-b4c1-3c106c02aca9" width="200" alt="image 3"/>
  <img src="https://github.com/user-attachments/assets/df7a9c02-5710-4931-b760-89f4ee0ae2a2" width="200" alt="image 4"/>
</div>

### Website

<div align="Center">
<img width="1364" height="631" alt="image" src="https://github.com/user-attachments/assets/2286f413-484a-42a5-a27a-151cbec0622d" />
</div>












  
