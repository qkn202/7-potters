# ⚡ 7 Potters (Bảy Potter) · Trận Không Chiến Bầu Trời Anh Quốc

> **Boardgame chiến thuật ẩn vai thời gian thực (Social Deduction & Hidden Role Strategy) dành cho cộng đồng Harry Potter Việt Nam (HPVN).**  
> Dựa trên chiến dịch lịch sử trong tập 7: *Harry Potter và Bảo bối Tử thần* — Cuộc không chiến trên bầu trời đêm để di tản Harry Potter từ số 4 Privet Drive (Little Whinging, Surrey) về nơi trú ẩn an toàn Trang Trại Hang Sóc (The Burrow).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-7--potters-181717?logo=github)](https://github.com/qkn202/7-potters.git)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 📖 1. Giới Thiệu & Bối Cảnh Cốt Truyện (Lore)

Vào đêm trước ngày sinh nhật thứ 17 của Harry Potter, bùa chú bảo vệ tại nhà Dursley sắp sửa tan biến. Hội Phượng Hoàng quyết định thực hiện một chiến dịch táo bạo: **7 thành viên uống thuốc Đa Quả Dịch để hóa trang thành 7 Harry Potter giả**, cùng các cận vệ thiện chiến bay trên chổi, Thestral và mô tô bay của Hagrid để mở đường máu xuyên qua vòng vây phục kích của Chúa Tể Voldemort và bè lũ Tử Thần Thực Tử.

Trong trò chơi, người chơi sẽ được chia ngẫu nhiên vào 2 phe đối đầu nghẹt thở, đan xen bởi suy luận, bùa chú chiến thuật, bảo bối phù thủy và sự hy sinh anh dũng.

---

## 🏆 2. Điều Kiện Thắng (Win Conditions)

| Phe Phái | Điều Kiện Thắng |
| :--- | :--- |
| **🦅 Hội Phượng Hoàng**<br>*(Order of the Phoenix)* | **1.** Đưa **Harry Potter thật** sống sót vượt qua toàn bộ các chặng bay để hạ cánh an toàn xuống **Hang Sóc (The Burrow - Chặng cuối)**.<br>**HOẶC**<br>**2.** Phát hiện và **tiêu diệt được Chúa Tể Voldemort** (qua biểu quyết Tước Đũa hoặc súng của Moody). |
| **🐍 Tử Thần Thực Tử**<br>*(Death Eaters / 4T)* | **1.** Tìm ra và **hạ sát thành công Harry Potter thật** trước khi cậu chạm tới Hang Sóc.<br>**HOẶC**<br>**2.** Quét sạch toàn bộ các thành viên Hội Phượng Hoàng trên bầu trời. |

---

## 🎭 3. Hệ Thống 21 Thẻ Bài Nhân Vật & Kỹ Năng

Trò chơi bao gồm **21 thẻ bài nhân vật** được chế tác thủ công với đồ họa viền vàng kim, cánh phượng hoàng lửa và rắn lục bảo thạch:

### 🦅 Phe Hội Phượng Hoàng (17 Vai Trò)
1. **Harry Potter (Kẻ Được Chọn · The Boy Who Lived):** Trái tim của chiến dịch. Nếu Harry chết, Hội vẫn có thể thắng nếu tiêu diệt được Voldemort, nhưng nhiệm vụ vô cùng gian nan.
2. **Ron Weasley (Người Bạn Trung Thành):** Lá chắn sống của Harry. Tự động nhận đòn hy sinh chết thay nếu Harry bị tấn công.
3. **Hermione Granger (Phù Thủy Uyên Bác):** Mỗi ban ngày, có thể gửi tin mật cho Quản Trò Merlin để soi danh tính thật của 1 người chơi.
4. **Albus Dumbledore (Hiệu Trưởng Vĩ Đại):** Ban ngày chọn bảo hộ 1 người chơi khỏi bị ám sát (không được bảo vệ 1 người 2 lượt liên tiếp).
5. **Severus Snape (Gián Điệp Nhị Trùng):** Thuộc Hội Phượng Hoàng nhưng mang Bế Quan Bí Thuật đỉnh cao — nếu Hermione soi sẽ thấy là TTTT, nhưng nếu Pettigrew soi lại thấy là HPH!
6. **Remus Lupin (Người Sói Hào Hiệp):** Sở hữu 1 bình thuốc hồi sinh duy nhất trong trận để cứu sống 1 đồng đội vừa ngã xuống ban ngày.
7. **Alastor "Mắt Điên" Moody (Thần Sáng Khét Tiếng):** Sở hữu 1 phát đạn Avada Kedavra vào ban đêm. Nếu bắn nhầm đồng minh Hội Phượng Hoàng, Moody sẽ tự vẫn vì ân hận.
8. **Rubeus Hagrid (Người Lai Khổng Lồ):** Thể lực phi thường, phải bị tấn công 2 lần mới tử trận.
9. **Arthur, Fred & George Weasley (Gia Tộc Weasley):** Liên kết ruột thịt sâu sắc — nếu 1 trong 3 người bị giết, 2 người còn lại sẽ chết theo (*Hiệu ứng Domino Weasley*).
10. **Mundungus Fletcher (Kẻ Hèn Nhát):** Tay buôn lậu chợ đen. Khi bị trúng đòn chí mạng, kích hoạt cơ chế khẩn cấp chọn 1 người sống bất kỳ để chết thay mình!
11. **Kingsley Shacklebolt (Thần Sáng Hoàng Gia):** Có 50% cơ hội (tung đồng xu Merlin) cứu sống đồng đội bị ám sát ban ngày.
12. **Bill Weasley & Fleur Delacour (Tình Yêu Veela):** Cặp đôi bất tử — chỉ chết khi cả hai cùng bị nhắm giết đồng thời trong cùng một đêm.
13. **Nymphadora Tonks (Biến Hình Sư):** Khi tử trận, có thể chọn biến hình kế thừa vai trò và năng lực của 1 người đã khuất.
14. **Bản Sao Harry (Polyjuice Decoys):** Uống Đa Quả Dịch mang khuôn mặt Harry, đóng vai trò nghi binh hút sát thương bảo vệ Harry thật.

### 🐍 Phe Tử Thần Thực Tử (4 Vai Trò)
15. **Chúa Tể Voldemort (He-Who-Must-Not-Be-Named):** Biết mặt toàn bộ thuộc hạ TTTT, nắm quyền quyết định đòn ám sát ban ngày (hoặc chọn Án Binh). Nếu Voldemort chết, Tử Thần Thực Tử thua ngay lập tức!
16. **Bellatrix Lestrange (Cuồng Tín Tử Vì Đạo):** Nếu bị treo cổ, ban ngày tiếp theo Voldemort thịnh nộ được quyền giết 2 người liên tiếp!
17. **Lucius Malfoy (Quý Tộc Xảo Quyệt):** Nếu bị treo cổ, ban ngày tiếp theo Voldemort bị tước trượng và cấm giết người.
18. **Peter Pettigrew (Đuôi Trùn Phản Bội):** Ban ngày có thể soi 1 người chơi để kiểm tra xem họ có thuộc Hội Phượng Hoàng hay không.

### 🧙‍♂️ Quản Trò (Merlin / Game Master)
- Đóng vai trò phân xử, thông báo các chặng bay, công bố biến cố thời tiết bầu trời và dẫn dắt câu chuyện qua hệ thống thông cáo nổi tự động.

---

## ✈️ 4. Cơ Chế Gameplay Nổi Bật

### 4.1. Hệ Thống Chặng Bay (Flight Track: 4 – 6 Chặng)
Đoàn xe bay phải vượt qua các chặng không gian hiểm trở:
- **Chặng 1: Bầu Trời Surrey Tĩnh Lặng (`PERFECT_DISGUISE`):** Đa Quả Dịch bảo vệ danh tính tối đa. Nếu mục tiêu bị tấn công có người Bay Hộ Tống, cả hai sẽ liệng chổi né đòn an toàn!
- **Chặng 2: Tầng Mây Giông & Sấm Chớp (`TURBULENCE_BLIND`):** Tầm nhìn mù mịt, sấm chớp rền vang, người hộ tống chắn gió làm chệch hướng bùa chú.
- **Chặng 3: Vòng Vây Hắc Ám & Phục Kích (`VOLDEMORT_AMBUSH`):** Chúa Tể Voldemort trực tiếp xuất trận truy sát.
- **Chặng 4: Hàng Rào Bảo Vệ Hang Sóc (`SAFEHOUSE_BURROW`):** Hạ cánh an toàn, kích hoạt màn chắn cổ xưa. *(Ở phòng đông người, hành trình mở rộng thêm Chặng 5 Trạm Khóa Cảng và Chặng 6 Hang Sóc).*

### 4.2. Cơ Chế Lõi Kép & Lửa Vàng Tự Vệ (Golden Flame Retaliation)
Theo nguyên tác, khi Voldemort tấn công Harry lần đầu tiên:
- Đũa phép lông đuôi phượng hoàng của Harry tự động nhận diện kẻ thù, **phóng ra dòng Lửa Vàng thiêu đốt đòn tấn công và tước đoạt cây đũa phép của Lucius Malfoy**.
- Voldemort bị cấm giết người ở đêm kế tiếp. Cơ chế Lửa Vàng chỉ kích hoạt **1 lần duy nhất trong toàn trận** để bảo vệ Harry thật.

### 4.3. Rương Bảo Bối Tiệm Phù Thủy Weasley (Weasleys' Wizard Wheezes)
Các phát minh ma thuật đặc biệt tiếp tế từ Fred & George Weasley:
- 🌑 **Bột Khói Mù Peru (Instant Darkness Powder):** Che phủ bầu trời đêm trong làn khói đen huyền bí, vô hiệu hóa hoàn toàn mọi đòn ám sát trong đêm.
- 🍬 **Kẹo Ngất Xỉu Cấp Tốc (Fainting Fancies):** Khiến 1 người chơi ngất xỉu và bị cấm tham gia biểu quyết Tước Đũa đêm đó.
- 🪞 **Gương Hai Chiều Sirius (Two-Way Mirror):** Soi thấu tâm can để kiểm tra người chơi thuộc phe Sáng hay phe Tối (bậc thầy bế quan bí thuật Snape được ngụy trang).
- 🔒 **Bùa Chống Trộm Weasley (Anti-Theft Ward):** Rương bảo bối chỉ chấp nhận thành viên Hội Phượng Hoàng còn sống kích hoạt. Tử Thần Thực Tử mở rương sẽ bị bùa chống trộm phát hiện và từ chối.

---

## 🚀 5. Những Cập Nhật & Sửa Lỗi Mới Nhất (Changelog)

Các tính năng quan trọng và cải tiến đã hoàn thiện trong các bản phát hành gần nhất:

### 🛡️ 1. Cơ Chế "Bay Hộ Tống" — Ai Cũng Có Thể Hộ Tống Được Không?
- **Quy tắc chuẩn:** Bất kỳ phù thủy nào còn sống (đặc biệt là phe Sáng) đều có quyền chọn 1 đồng đội đáng tin cậy để **"Bay Hộ Tống"** trong lượt ban ngày.
- **Xử lý khử xung đột theo từng chặng (Harmonized Resolution):**
  - **Ở Chặng 1 & Chặng 2 (Chặng né đòn):** Nếu mục tiêu bị tấn công có người bay hộ tống, cả hai sẽ liệng chổi né đòn an toàn vào làn mây. **Tia Lửa Vàng được giữ nguyên, không bị kích hoạt lãng phí!**
  - **Ở Chặng 3+ (Chặng Voldemort phục kích):**
    - Nếu Tia Lửa Vàng còn hiệu lực: Lửa Vàng ưu tiên bùng nổ bảo vệ Harry và tước trượng Voldemort, **người hộ tống không phải hy sinh oan uổng**.
    - Nếu Tia Lửa Vàng đã dùng: Người bay hộ tống sẽ dũng cảm lấy thân mình chắn đòn tử thủ (hy sinh) để bảo vệ Harry hoặc đồng đội mục tiêu sống sót!

### 🚫 2. Nút "Không Giết Ai Cả (Án Binh Bất Động)" Cho Phe Tử Thần Thực Tử (4T)
- Bổ sung nút **"Không Giết Ai Cả / Án Binh"** trong giao diện ban ngày của Phe Tử Thần Thực Tử.
- **Ý nghĩa chiến thuật:** Giúp Voldemort và các Tử Thần Thực Tử có quyền chủ động hoãn đòn ám sát, thăm dò tình hình, tránh kích hoạt sớm Lửa Vàng của Harry hoặc tránh sập bẫy Bellatrix/Mundungus.
- Xử lý mượt mà cả 2 kịch bản:
  1. Khi **Voldemort còn sống**: Lệnh `NONE` có hiệu lực tối cao, huỷ đòn ám sát của lượt.
  2. Khi **Voldemort đã chết**: Tử Thần Thực Tử bỏ phiếu tập thể; nếu số phiếu chọn `NONE` chiếm đa số thì phe Ác đồng lòng án binh.

### 🎭 3. Kỹ Năng Mundungus Fletcher: Người Chơi Tự Chọn Hay Tự Động?
- **Cơ chế chính thức:** Kỹ năng của Mundungus **do chính người chơi tự tay bấm chọn mục tiêu chết thay**, không bị cưỡng ép tự động!
- Khi Mundungus bị bắn trúng đòn tử trận, hệ thống lập tức kích hoạt trạng thái ngắt quãng khẩn cấp (`INTERRUPT_STATE: MUNDUNGUS_SWAP`):
  - Màn hình người chơi cầm Mundungus sẽ hiện popup đặc biệt: *"Mundungus Phục Kích Thoát Thân! Hãy chọn 1 người chết thay!"*.
  - Người chơi có thể tự do bấm chọn bất kỳ ai còn sống trên bàn để thế mạng.
  - *Lưu ý:* Cơ chế chỉ tự động chọn ngẫu nhiên khi người chơi là **Bot NPC**.

### 🎲 4. Thuật Toán Chia Bài Công Bằng & Chống Lặp Vai (Anti-Repetition Engine)
- Tích hợp giải thuật xáo bài ngẫu nhiên chuẩn **Fisher-Yates (Knuth Shuffle)**.
- Bổ sung bộ nhớ xoay vòng `previousRoleMap`:
  - Người chơi (kể cả Host phòng) được đảm bảo **100% không bị lặp lại các vai trò chính (Harry Potter, Voldemort) qua 2 ván liên tiếp**.
  - Xóa bỏ triệt để thiên vị vị trí phòng (Positional Bias), phân phối xác suất đều cho mọi người chơi trong phòng.

### 💡 5. Trợ Lý Gợi Ý Hành Động Động (Dynamic Action Coach)
- Hiển thị bảng chỉ dẫn hành động thời gian thực trên màn hình người chơi (`PlayerScreen`):
  - Phân tích vai trò, phe phái và giai đoạn ngày/đêm.
  - Hướng dẫn rõ ràng: khi nào nên Bay Hộ Tống, khi nào nên dùng bảo bối Weasley, cách chọn mục tiêu tước đũa hoặc án binh.

### 📱 6. Nâng Cấp Toàn Diện UI/UX Mobile & Responsive
- Thiết kế tối ưu hiển thị trên màn hình điện thoại (Viewport 375px – 430px):
  - Thanh trạng thái chặng bay `FlightTrack` thu gọn mượt mà.
  - Thẻ căn cước phù thủy cố định giúp người chơi luôn nhìn thấy vai trò và năng lực của mình.
  - Bảng danh sách người chơi và nút thao tác được phóng to chuẩn công thái học di động, thao tác dễ dàng bằng một tay.
  - Khóa góc nhìn (Perspective Lock) cố định đúng vai người chơi khi tham gia phòng mạng xã hội, ngăn ngừa lỗi hiển thị nhầm sang quyền Quản trò.

### 🌐 7. Đồng Bộ Thời Gian Thực & Đăng Nhập Tài Khoản HPVN
- Đăng nhập trực tiếp bằng tài khoản **Harry Potter Việt Nam (HPVN)**, đồng bộ Nhà Hogwarts (Gryffindor, Slytherin, Ravenclaw, Hufflepuff) và danh xưng phù thủy.
- Đồng bộ hóa trạng thái phòng chơi tức thời qua **Mạng Lò Sưởi Floo (Supabase Realtime / Firebase / WebRTC Peer Network)** với cơ chế tự động kết nối lại khi mạng di động chập chờn.

### 🚀 8. Triển Khai Hoàn Tất Lên Vercel & GitHub
- Dự án đã được build tối ưu, cấu hình đầy đủ biến môi trường và triển khai thành công lên **Vercel** và đồng bộ kho mã nguồn **GitHub**.

---

## 🛠️ 6. Cài Đặt & Khởi Chạy Dự Án (Developer Guide)

### Yêu cầu môi trường
- **Node.js**: >= 18.18.0
- **npm** / **yarn** / **pnpm** / **bun**

### Cài đặt dependencies
```bash
git clone https://github.com/qkn202/7-potters.git
cd 7-potters
npm install
```

### Chạy môi trường phát triển (Local Development)
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm.

### Kiểm thử hệ thống tự động (Automated Test Suites)
Dự án được bảo vệ bởi bộ kiểm thử tự động toàn diện:

1. **Kiểm thử 13 cơ chế Boardgame cốt lõi:**
   ```bash
   npx tsx tests/test_game_mechanics.ts
   ```
   *(Kiểm tra điều kiện thắng Hang Sóc, Tia Lửa Vàng, Bột Bóng Tối, Kẹo Ngất Xỉu, Bay Hộ Tống, Gương Sirius, Khử xung đột, Chia bài chống lặp, Nút Không Giết Án Binh).*

2. **Kiểm thử 8 kịch bản Multiplayer & Đồng bộ mạng thời gian thực:**
   ```bash
   npx tsx tests/test_seven_potters_multiplayer.ts
   ```
   *(Kiểm tra kết nối phòng, presence, gửi nhận action, bùa chú tức thời, chat Mạng Floo và khôi phục mất kết nối).*

3. **Kiểm tra cân bằng và mô phỏng tỷ lệ thắng:**
   ```bash
   npx tsx tests/simulate_flight_balance.ts
   npx tsx tests/simulate_flight_optimization.ts
   ```

### Đóng gói ứng dụng (Build Production)
```bash
npm run build
npm run start
```

---

## 📜 7. Bản Quyền & Giấy Phép

- Trò chơi được phát triển phi lợi nhuận bởi cộng đồng hâm mộ **Harry Potter Việt Nam (HPVN)**.
- Thế giới phù thủy, nhân vật và các thuật ngữ ma thuật thuộc bản quyền của **J.K. Rowling** và **Warner Bros. Entertainment Inc.**
- Mã nguồn được phân phối theo giấy phép MIT License.
