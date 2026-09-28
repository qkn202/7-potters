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
5. **Severus Snape (Bậc Thầy Bế Quan Bí Thuật · Điệp Viên Hai Mang):** 
   - **Kỹ năng Đêm Chủ Động — `Bọc Lót Sectumsempra`:** Chọn bảo vệ 1 người trong đêm. Nếu mục tiêu bị Tử Thần Thực Tử tấn công, nhát chém Sectumsempra của Snape sẽ can thiệp rạch nát đòn ám sát, cứu sống mục tiêu! Nhưng nếu mục tiêu *không* bị tấn công, bùa lạc sẽ sượt qua tai khiến mục tiêu bị câm lặng kỹ năng ở vòng kế tiếp.
   - **Nội tại — `Bế Quan Bí Thuật` (Occlumency):** Tâm trí bất khả xâm phạm — miễn nhiễm hoàn toàn trước bùa soi của Hermione ("Tâm Trí Bất Khả Xâm Phạm") và đánh lừa khứu giác của Peter Pettigrew.
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
18. **Peter Pettigrew (Đuôi Trùn · Khứu Giác Chuột & Món Nợ Mạng):** 
   - **Kỹ năng Tức Thời — `Đánh Hơi Nhà Hang Sóc`:** Nhờ 12 năm sống lốt chuột Scabbers, Pettigrew có thể ngửi mùi nhận diện đích danh **Harry Potter Thật** và **Ron Weasley**, phân biệt các nhân vật Đặc Biệt khác và Bản Sao thường.
   - **Hạn chế — `Món Nợ Sinh Mệnh` (Life Debt):** Bàn tay bạc bị co giật/phản phệ nếu chính tay Pettigrew trực tiếp bỏ phiếu giết Harry Potter thật.
   - **Nội tại — `Cắt Ngón Tay Hóa Chuột Đào Tẩu`:** Lần đầu bị trục xuất ban ngày, Pettigrew giả chết hóa chuột trốn thoát, sống sót qua phiên xử nhưng mất quyền biểu quyết ở ngày kế tiếp.

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

### ⚖️ 9. Bảng Phân Bổ Cân Bằng Tối Ưu (N = 4..15 Phù Thủy) & Thuật Toán Mô Phỏng Monte Carlo 10.000 Ván
- **Vấn đề đã khắc phục:** Loại bỏ hoàn toàn công thức thô `Math.floor(N / 3)`. Ở các phòng ít người ($N=4, 5$), nếu phe Tối có 2 người thì chỉ cần 1 thành viên HPH tử trận ban ngày là Tử Thần Thực Tử đạt thế cân bằng số lượng (*Parity Condition*) và thắng ngay tại Vòng 1 với tỷ lệ lên đến **74.9%**.
- **Hiệu chuẩn bảng tỷ lệ vàng (`OPTIMAL_BALANCE_SPEC`):**
  - **N = 4:** 1 Tử Thần : 3 HPH · 4 Chặng bay · HPH thắng 57.7% / 4T thắng 42.3% (Cân bằng xuất sắc).
  - **N = 5:** 1 Tử Thần : 4 HPH · 4 Chặng bay · Cấm tuyệt đối 2 4T ở phòng 5 người để tránh sập ván sớm.
  - **N = 6:** 2 Tử Thần : 4 HPH · 4 Chặng bay · HPH thắng **52.3%** / 4T thắng **47.7%** (🏆 Tỷ Lệ Vàng).
  - **N = 7:** 2 Tử Thần : 5 HPH · 5 Chặng bay.
  - **N = 8:** 3 Tử Thần : 5 HPH · 5 Chặng bay · HPH thắng **46.5%** / 4T thắng **53.5%** (🏆 Tỷ Lệ Vàng).
  - **N = 9:** 3 Tử Thần : 6 HPH · 5 Chặng bay.
  - **N = 10:** 4 Tử Thần : 6 HPH · 5 Chặng bay · HPH thắng **48.7%** / 4T thắng **51.3%** (🏆 Tỷ Lệ Vàng).
  - **N = 11:** 4 Tử Thần : 7 HPH · 6 Chặng bay.
  - **N = 12:** 4 Tử Thần : 8 HPH · 6 Chặng bay · Kích hoạt **Phục kích kép** · HPH thắng **52.1%** / 4T thắng **47.9%** (🏆 Tỷ Lệ Vàng).
  - **N = 13:** 5 Tử Thần : 8 HPH · 6 Chặng bay.
  - **N = 14:** 5 Tử Thần : 9 HPH · 6 Chặng bay · Kích hoạt **Phục kích kép** · HPH thắng **52.0%** / 4T thắng **48.0%** (🏆 Tỷ Lệ Vàng).
  - **N = 15:** 5 Tử Thần : 10 HPH · 6 Chặng bay · Kích hoạt **Phục kích kép** · HPH thắng **55.0%** / 4T thắng **45.0%** (🏆 Tỷ Lệ Vàng).

### ⚡ 10. Cơ Chế Phục Kích Kép Chặng 3 (Large Room Ambush) Cho Phòng Đông (N ≥ 12)
- **Cơ sở phân tích số người chết (Attrition Rate):**
  - Tỷ lệ chết do 4T ám sát bình quân chỉ đạt **0.22 - 0.35 người/vòng** (do bị cản bởi quá nhiều tầng phòng thủ: *Tia Lửa Vàng*, *Né đòn Hộ tống*, *Ron hy sinh*, *Dumbledore*, *Kingsley*, *Hagrid 2 mạng*).
  - Tỷ lệ chết do biểu quyết Expelliarmus của dân làng ban đêm rất cao: **0.75 - 0.98 người/vòng** (Hermione giúp tăng tỷ lệ phát hiện kẻ thù lên 50 - 65%).
  - Ở phòng đông người ($N \ge 12$), nếu 4T chỉ ám sát 1 người mỗi ngày thì dân làng sẽ vote chết Voldemort trước khi tới Hang Sóc (HPH thắng > 85%).
- **Giải pháp:** Khi $N \ge 12$, nếu Chúa Tể Voldemort còn sống khi đoàn bay tiến vào **Chặng 3: Vòng Vây Hắc Ám & Phục Kích (`VOLDEMORT_AMBUSH`)**, Tử Thần Thực Tử được phát động **ám sát liên hoàn 2 mục tiêu cùng lúc**, đưa tỷ lệ thắng cả 2 phe về mức cân bằng hoàn hảo ~50 - 52%.

### 📊 11. Widget Tỷ Lệ Phe Chiến Thuật Trong Lobby (Monte Carlo Calibrated)
- Tích hợp widget trực quan ngay trên sảnh chờ trước khi bắt đầu trận:
  - Tự động nhận diện sĩ số phù thủy thực tế trong phòng.
  - Hiển thị số lượng Hội Phượng Hoàng vs Tử Thần Thực Tử cùng số chặng bay đề xuất.
  - Hiển thị thanh tiến trình trực quan song hành Gryffindor (Đỏ/Vàng) và Slytherin (Xanh Ngọc).
  - Gắn huy hiệu cảnh báo kích hoạt *Phục Kích Kép Chặng 3* cho phòng đông người.

### 🪄 12. Kỹ Năng Chuẩn Nguyên Tác: Severus Snape & Peter Pettigrew
- **Severus Snape (Bậc Thầy Bế Quan Bí Thuật · Điệp Viên Hai Mang):**
  - **Kỹ năng Đêm Chủ Động — `Bọc Lót Sectumsempra` (`NIGHT`):** Chọn bọc lót cho 1 mục tiêu. Nếu người đó bị Tử Thần Thực Tử tấn công, nhát chém Sectumsempra của Snape sẽ can thiệp rạch nát đòn ám sát, cứu sống mục tiêu! Nhưng nếu người đó *không* bị tấn công, thần chú lạc sẽ sượt qua tai (như George Weasley mất tai) làm câm lặng kỹ năng chủ động ở vòng kế tiếp (`SECTUMSEMPRA_SILENCED`).
  - **Nội tại — `Bế Quan Bí Thuật` (Occlumency):** Miễn nhiễm hoàn toàn trước bùa soi của Hermione ("Tâm Trí Bất Khả Xâm Phạm") và đánh lừa khứu giác của Peter Pettigrew.
- **Peter Pettigrew (Đuôi Trùn · Khứu Giác Chuột, Món Nợ Mạng & Hóa Thú):**
  - **Kỹ năng Tức Thời — `Đánh Hơi Nhà Hang Sóc` (`INSTANT`):** Nhờ 12 năm sống ở dạng chuột Scabbers bên cạnh Ron, Pettigrew có thể ngửi mùi nhận diện đích danh **Harry Potter Thật** (`HARRY_POTTER`) và **Ron Weasley** (`RON_WEASLEY`), đồng thời phân biệt nhân vật Đặc Biệt (`SPECIAL`) và Bản Sao thường (`NORMAL`).
  - **Hạn chế — `Món Nợ Sinh Mệnh` (Life Debt):** Bàn tay bạc bị co giật/phản phệ nếu chính tay Pettigrew trực tiếp bỏ phiếu ám sát Harry Potter thật (các Tử Thần khác vẫn có thể giết).
  - **Nội tại — `Cắt Ngón Tay Hóa Chuột Đào Tẩu` (Rat Escape):** Lần đầu tiên bị biểu quyết trục xuất ban ngày, Pettigrew tự cắt ngón tay hóa chuột giả chết trốn thoát, sống sót qua phiên xử nhưng bị cấm biểu quyết ở ngày kế tiếp (`VOTE_SILENCED`).

### ⚖️ 13. Đại Tu Thuật Toán Phân Vai Công Bằng 2 Giai Đoạn (Guaranteed Fair Role Engine & Anti-TTTT Streak Audit)
Khắc phục triệt để hiện tượng người chơi bị bắt làm Tử Thần Thực Tử (TTTT) quá nhiều lần liên tục khi đổi phòng, chuyển tab hoặc trong các phòng 4 – 15 người:
- **Triệt tiêu "Bẫy Tân Binh" (Newcomer Priority Trap):** Trước đây, người mới vào phòng hoặc chuyển tab bị gán `totalGames = 0, totalEvil = 0` dẫn đến `evilRatio = 0` $\rightarrow$ điểm ưu tiên đạt mức tối đa 100 điểm, luôn luôn bị ép làm TTTT ở ván đầu tiên. Thuật toán mới khởi tạo điểm trung tính (`evilCount / N`) và giảm nhẹ `-15 điểm` cho tân binh trong ván đầu tiên để ưu tiên làm quen nhịp game ở phe HPH.
- **Định danh Thiết bị Bền Vững (`Persistent Device ID`):** Lưu trữ cố định `seven-potters-device-id` trên trình duyệt. Khi người chơi chuyển tab, ngắt kết nối di động hoặc bị dọn dẹp khỏi lobby sau 90 giây: khi quay lại, hệ thống nhận diện đúng người cũ qua `deviceId`, không sinh ID rác mới, bảo toàn lịch sử chuỗi TTTT.
- **Bắt tay Lịch sử Liên Phòng (`Cross-Room History Handshake`):** Client tự lưu lịch sử vai trò cá nhân vào `localStorage` sau mỗi ván. Khi tham gia bất kỳ phòng mới nào, gói `JOIN_REQUEST` gửi kèm `personalHistory`. Host mới lập tức nhận diện: *"Người chơi này vừa làm TTTT ở phòng cũ $\rightarrow$ Khóa cứng không cho làm TTTT ở phòng này!"*.
- **Khóa Cứng (`Hard Lock`) & Hồi Chiêu TTTT (`Soft Cooldown`):**
  - **Hard Lock:** Nếu vừa làm TTTT ở ván liền kề, điểm ưu tiên bị phạt `-1,000,000 điểm` $\rightarrow$ **Xác suất làm TTTT liên tiếp = 0%** (Max streak = 1 tuyệt đối).
  - **Soft Cooldown:** Tích lũy điểm hạn hán `+20 điểm/ván` cho mỗi ván chơi phe HPH, luân phiên đều đặn TTTT cho mọi người chơi trong phòng.

---

## 🛠️ 6. Cài Đặt & Khởi Chạy Dự Án (Developer Guide)

### Triển khai Trực tuyến (Live Production)
- 🌐 **Website chính thức:** [https://seven-potters.vercel.app](https://seven-potters.vercel.app)
- 📦 **Mã nguồn:** [GitHub - qkn202/7-potters](https://github.com/qkn202/7-potters.git)

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

1. **Kiểm thử 19 cơ chế Boardgame & Thuật toán công bằng:**
   ```bash
   npx tsx tests/test_game_mechanics.ts
   ```
   *(Kiểm tra toàn bộ 19/19 test cases: Hang Sóc, Tia Lửa Vàng, Bột Bóng Tối, Kẹo Ngất Xỉu, Bay Hộ Tống, Gương Sirius, Khử xung đột, Chia bài chống lặp, Nút Án Binh, Kingsley 50%, Snape Sectumsempra & Bế quan bí thuật, Pettigrew ngửi mùi & Nợ mạng & Thoát chết hóa chuột, Bắt tay liên phòng, Chuyển tab Device ID, và Stress test phòng 4 - 15 người qua 700+ ván).*

2. **Kiểm thử 8 kịch bản Multiplayer & Đồng bộ mạng thời gian thực:**
   ```bash
   npx tsx tests/test_seven_potters_multiplayer.ts
   ```
   *(Kiểm tra kết nối phòng, presence, gửi nhận action, bùa chú tức thời, chat Mạng Floo và khôi phục mất kết nối).*

3. **Mô phỏng cân bằng toàn diện N = 4..15 qua 10.000 ván:**
   ```bash
   npx tsx tests/simulate_player_count_balance.ts
   ```
   *(Mô phỏng 10.000 ván đấu cho từng mốc sĩ số, phân tích tỷ lệ thắng, tỷ lệ tử vong do ám sát vs biểu quyết).*

4. **Kiểm tra cân bằng và mô phỏng tỷ lệ chặng bay:**
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
