# Sockbound — Gia tinh tìm vớ (A Hogwarts Adventure)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-blue.svg)]()
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-success.svg)]()

> **Một chiếc vớ. Cả đội tự do.**  
> Party game co-op vui nhộn 2–8 người chơi lấy cảm hứng từ lối chơi gắn kết của *PICO PARK* kết hợp thế giới phù thủy Hogwarts. Nhân vật chính là những chú gia tinh nhỏ bé cùng nhau vượt qua các chướng ngại vật ma thuật để tìm chiếc vớ tự do.  
> **Kiến trúc Zero Dependencies:** Toàn bộ dự án được xây dựng thuần bằng **Node.js + HTML5 Canvas 2D + Vanilla JS/CSS**, không sử dụng bất kỳ thư viện hay framework bên thứ ba nào.

---

## 🌟 Điểm nổi bật & Cập nhật mới nhất

### 1. Hành trình sử thi 12 chặng (Expanded Scale)
- **8 phòng chơi độc nhất:** Phòng sinh hoạt chung, Đại Sảnh Đường, Lớp học Bùa chú, Nhà kính Thảo dược, Cầu thang di động, Nhà bếp gia tinh, Phòng Chứa Bí Mật, Sân lâu đài Hogwarts.
- **Chiều dài bản đồ mở rộng quy mô lớn:** Mỗi chặng kéo dài hơn 1,800px; chiều rộng toàn bộ mỗi map đạt từ **22,000px đến 25,000px**, camera cuộn mượt mà theo tâm đội qua từng phân đoạn phong phú.
- **Nâng tầm độ khó và độ cao (High Vertical Climbing):** Các bậc đá và chòi tháp được nâng cao tới `y = 340` (vách tường cao hơn 230px), đòi hỏi cả đội phải leo bậc thang liên hoàn hoặc dùng lò xo nảy cao.
- **Vực sâu mở rộng đầy thử thách (Wider Chasms & Deep Abysses):** Các vực thẳm được kéo dài từ 240px đến 390px, bắc qua bởi cầu gỗ bập bênh bập bùng, các đảo đá lơ lửng giữa không trung và bệ đá di động (elevators) nâng hạ liên tục theo chu kỳ.
- **12 chặng dừng theo cốt truyện (Authored Chapters):** Mỗi phòng gồm 12 phân đoạn địa hình đặc thù (tổng cộng 96 phân đoạn trên toàn game).
- **11 trạm cờ lưu điểm (Checkpoints):** Thiết kế khoảng cách rộng rãi, an toàn cho cả đội hình 2 đến 8 gia tinh.
- **Bán kính bắt vớ nâng lên 80px:** Gia tinh nhảy qua không trung vẫn chộp vớ nhạy và đã tay.

### 2. Cơ chế phối hợp & Vật lý hài hước
- **Dây xích đàn hồi (Elastic Rope Tether):** Dây bắt đầu căng ở 185px và giãn tối đa 300px. Khi một người nhảy lên, lực căng dây có thể kéo bổng người bên dưới vượt chướng ngại vật.
- **Treo lơ lửng & Kéo bạn qua vực (Chained Together Dangling & Hauling):** Khi 1 hoặc nhiều gia tinh trượt chân rớt xuống vực, cả đội **KHÔNG** bị chết! Dây xích sẽ giữ các bạn lơ lửng bên dưới bờ vực. Đồng đội đứng vững trên nền đất có thể ấn di chuyển ngược chiều hoặc nhảy để kéo bổng cả nhóm lên bờ vực an toàn. Chỉ khi **TẤT CẢ** thành viên trong đội cùng lọt xuống vực thì cả đội mới hồi sinh tại cờ checkpoint gần nhất.
- **Chống kẹt gia tinh (Collision Unblock):** Khi nhiều người dồn lại ở mép vực hoặc trạm cờ, người di chuyển rời xa đồng đội được giải phóng ngay lập tức, không bị kẹt chùm.
- **Ném đồng đội (Teammate Toss):** Ấn phím ném (`X` hoặc `/`) để phóng bổng người bạn gần nhất bay về phía trước vượt qua vực sâu.
- **Địa hình ma thuật phong phú:**
  - 🧈 **Sàn bơ trơn trượt (Butter Slides):** Tăng quán tính trượt dài, đòi hỏi cả đội phối hợp ghìm dây.
  - 💨 **Quạt gió ngược chiều (Wind Fans):** Đẩy lùi những gia tinh tiến lẻ loi, cần cả đội cùng dồn sức.
  - ⚖️ **Cầu bập bênh (Tilting Seesaws):** Cầu gỗ dài tới 390px bắc qua vực thẳm; một người làm đối trọng cho bạn leo qua.
  - 📦 **Băng chuyền đảo chiều (Conveyors):** Băng chuyền chuyển hướng nhịp nhàng theo chu kỳ.
  - 🎃 **Vật cản đường va chạm đẩy lùi (Obstacle Knockback):** Bí ngô nảy và cánh cửa xoay ma thuật chặn đường vật lý thực thụ. Khi chạm vào, gia tinh sẽ **bị đẩy dội lùi lại phía sau** kèm hiệu ứng sao văng và xoay vòng, triệt tiêu đà chạy tới chứ không bị mất máu hay tự động lướt xuyên qua. Người chơi bắt buộc phải căn nhịp nhảy vượt qua.

### 3. Đồ họa Procedural & Hiệu ứng sắc nét
- Đồ họa Canvas 2D vẽ theo phong cách vẽ tay thủ công với bảng màu phù thủy Hogwarts ấm cúng.
- Hệ thống hạt ma thuật (magic sparks, bụi bay, hiệu ứng bơ trượt, sao vàng khi ăn cờ và nhặt vớ).
- Khăn choàng 4 nhà Hogwarts (Gryffindor, Slytherin, Ravenclaw, Hufflepuff) chuyển động đuôi khăn theo quán tính chạy/nhảy.
- Biển chỉ dẫn từng chặng và thanh tiến độ hành trình trực quan trên đầu màn hình (`CHẶNG X/12`).

---

## 🎮 Ba chế độ chơi linh hoạt

### 1. Trực tuyến toàn cầu (Supabase Realtime Cloud) — Khuyên dùng
- **Kết nối đám mây không cần máy chủ riêng:** Tích hợp trực tiếp với dự án Supabase Realtime dùng chung từ các game Hogwarts (*7-potters*, *hogwarts-duel-3d*).
- **Mã phòng 6 ký tự & Link mời tức thì:** Chủ phòng tạo phòng sẽ có mã 6 ký tự hoặc link trực tiếp dạng `https://hogwarts-park.vercel.app/?room=MÃ_PHÒNG`. Người bạn mở link sẽ tự động vào sảnh chờ.
- **Sảnh chờ trực tuyến toàn cầu (Live Room Browser):** Danh sách các phòng đang mở trên Supabase Realtime hiển thị trực tiếp ở sảnh, cho phép bạn bè vào ngay chỉ với 1 cú click `Vào ngay ✦`.
- **Đồng bộ thời gian thực & Host Migration:** Mô phỏng vật lý 60 FPS độ trễ thấp qua Supabase Realtime WebSockets. Nếu chủ phòng ngắt kết nối, quyền Host tự động chuyển giao mượt mà cho gia tinh tiếp theo mà không làm gián đoạn ván đấu.
- **Khán đài trực tuyến (Spectator Mode):** Khán giả tham gia cổ vũ mà không chiếm vị trí trong 8 gia tinh.

### 2. Chung bàn phím (Local Co-op 2–8 người)
- Chạy trực tiếp 100% trong trình duyệt (offline hoàn toàn, không cần internet).
- Phù hợp chơi nhóm bạn bè quây quần bên một chiếc máy tính.
- Hỗ trợ phím riêng biệt cho cả 8 gia tinh:
  - **P1:** `A` `D` `W` + `X` (ném bạn) / `Space` (nhảy)
  - **P2:** `←` `→` `↑` + `/`
  - **P3:** `J` `L` `I` + `O`
  - **P4:** `F` `H` `T` + `Y`
  - **P5:** `Z` `C` `S` + `V`
  - **P6:** `B` `M` `N` + `,`
  - **P7:** `1` `3` `2` + `4`
  - **P8:** `7` `9` `8` + `0`
- Hỗ trợ nút điều khiển cảm ứng (Touch Controls) cho màn hình chạm hoặc tablet.

### 3. Mạng LAN nội bộ (Local Server port 3017)
- Dành cho mạng văn phòng hoặc mạng Wi-Fi gia đình không có kết nối internet ra ngoài.
- Khởi chạy bằng `npm start`, server Node.js quản lý phòng và truyền phát Server-Sent Events (`/api/events`).

---

## 🏆 Hệ thống tính điểm & Xếp hạng sao

| Hạng mục | Điểm thưởng | Ghi chú |
|---|---|---|
| **Cờ nghỉ (Checkpoints)** | `+200` điểm / cờ | Tối đa 11 trạm = **2,200 điểm** (chỉ cộng 1 lần khi cả đội đi qua) |
| **Tìm được chiếc vớ** | `+500` điểm | Vớ được bảo toàn ngay cả khi cả đội hồi sinh |
| **Cả đội cùng thoát** | `+1,000` điểm | Tất cả gia tinh cùng chạm vào khu vực cửa ra |
| **Thưởng tốc độ (Speed Bonus)** | Tối đa `+700` điểm | `max(0, 1000 - floor(giây * 3))` |
| **Thưởng cẩn thận (Care Bonus)** | Tối đa `+600` điểm | `max(0, 600 - số lần ngã * 50)` |
| **TỔNG ĐIỂM HOÀN HẢO** | **5,000 điểm** | Điểm chung đồng đội, không có điểm phạt âm |

- 🌟 **Xếp hạng sao:**
  - ★★★ **3 Sao:** Đạt từ `5,000` điểm (Chạy nhanh, hoàn thành trọn vẹn, không để rơi bạn).
  - ★★☆ **2 Sao:** Đạt từ `4,200` điểm.
  - ★☆☆ **1 Sao:** Hoàn thành màn chơi.

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ

Yêu cầu máy đã cài **Node.js 18+**. Không cần chạy `npm install` vì dự án không dùng thư viện ngoài!

```sh
# 1. Di chuyển vào thư mục dự án
cd hogwarts-park

# 2. Khởi chạy máy chủ
npm start

# 3. Mở trình duyệt tại:
# http://localhost:3017
```

### Chọn nhanh màn chơi qua URL
Bạn có thể mở trực tiếp bất kỳ màn chơi nào qua tham số query `?level=N` (từ 0 đến 7):
- `http://localhost:3017/?level=0` : Màn 1 — Phòng sinh hoạt chung
- `http://localhost:3017/?level=7` : Màn 8 — Chòi canh Rừng Cấm (12 chặng, dài 14,320px)

---

## 🧪 Kiểm thử chất lượng (Test Suite)

Dự án có bộ kiểm thử tự động toàn diện bao quát physics, va chạm, mạng LAN, camera và kịch bản 56 phòng chơi:

```sh
# Kiểm tra cú pháp toàn bộ file nguồn
npm run check

# Chạy test suite 19 bài kiểm thử
npm test
```

Tất cả 19 bài kiểm thử đều vượt qua 100%:
- Nhảy, ném bạn, chồng người, dây xích đàn hồi.
- Chướng ngại vật bí ngô, cửa xoay, quạt gió, đệm nảy, băng chuyền, cầu bập bênh.
- Mô phỏng giải thuật tự động vượt chướng ngại vật cho toàn bộ **8 phòng × nhóm từ 2 đến 8 người chơi** (56 tổ hợp).
- API máy chủ LAN: tạo phòng, vào phòng, ngắt kết nối, chuyển host, SSE streaming, khán giả.
- Cơ chế đu dây vực sâu (dangling & hauling).
- Bảng điểm và tiêu chuẩn 11 checkpoints 5,000 điểm.

---

## 🌐 Triển khai Vercel & GitHub

- **GitHub Repository:** [qkn202/hogwarts-park](https://github.com/qkn202/hogwarts-park)
- **GitHub Independent Branch trên undercover-hogwarts:** [qkn202/undercover-hogwarts/tree/hogwarts-park](https://github.com/qkn202/undercover-hogwarts/tree/hogwarts-park)
- **GitHub Independent Branch trên 7-potters:** [qkn202/7-potters/tree/hogwarts-park](https://github.com/qkn202/7-potters/tree/hogwarts-park)
- **Vercel Production Deployment:** [https://hogwarts-park.vercel.app](https://hogwarts-park.vercel.app) (HPVN Team)

---

## 📜 Giấy phép
Dự án được phát hành dưới giấy phép MIT. Mã nguồn hoàn toàn mở cho cộng đồng người hâm mộ Harry Potter.
