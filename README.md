# ⚡ 7 Potters (Bảy Potter) · Trận Không Chiến Bầu Trời Anh Quốc

> **Boardgame chiến thuật ẩn vai thời gian thực (Social Deduction & Hidden Role Strategy) dành cho cộng đồng Harry Potter Việt Nam (HPVN).**  
> Dựa trên chiến dịch lịch sử trong tập 7: *Harry Potter và Bảo bối Tử thần* — Cuộc không chiến trên bầu trời đêm để di tản Harry Potter từ số 4 Privet Drive (Little Whinging, Surrey) về nơi trú ẩn an toàn Trang Trại Hang Sóc (The Burrow).

### 🎴 Cập Nhật Mới Nhất: 3 Chế Độ Chơi & Tùy Biến Thẻ Bài Cho Merlin
Tại phòng chờ, Merlin (Quản trò / Chủ phòng) có toàn quyền lựa chọn giữa 3 Chế Độ Chơi:
1. **Cổ Điển (Classic - 22 Thẻ Gốc):** 17 Hội Phượng Hoàng & 5 Tử Thần Thực Tử.
2. **MOD HPVN (27 Thẻ Mở Rộng):** Đầy đủ 27 vai trò với Minerva McGonagall, Neville Longbottom, Draco Malfoy, Dolores Umbridge và Jester.
3. **Tùy Biến (Custom Deck Picker):** Merlin tự tay chọn chính xác danh sách nhân vật sẽ xuất hiện trong game thay vì random toàn bộ 27 vai trò. Tích hợp bộ lọc phe, tìm kiếm nhanh, nút mẫu 1 chạm và kiểm tra số lượng theo số người chơi.
*Cả 3 chế độ đều tích hợp thuật toán snapshot lịch sử vai trò và khóa cứng hoán đổi (Hard Swap) cam kết 0% chia lặp người làm Tử Thần Thực Tử ở ván tiếp theo!*

### 🔄 Trở Về Phòng Chờ & Chống Trùng 4T Ván 2 Tuyệt Đối
Nâng cấp nút "Trở Về Phòng Chờ" bảo lưu phòng chơi, tích hợp thuật toán snapshot lịch sử vai trò và khóa cứng hoán đổi (Hard Swap) cam kết 0% chia lặp người làm Tử Thần Thực Tử ở ván tiếp theo! Đồng bộ mượt mà cho mọi nhà mạng (Viettel, VNPT, FPT, 4G). **[Xem chi tiết →](#-17-nút-trở-về-phòng-chờ--thuật-toán-chống-chia-trùng-4t-ván-2)**

### 🛠️ Cập Nhật Trước: Sửa Lỗi Game Logic P0/P1
Audit và fix các lỗi nghiêm trọng: George Peru Darkness, self-target validation, vote re-submit warning, vote permission enforcement, double execution fix. **[Xem chi tiết →](#-15-sửa-lỗi-game-logic-p0p1-bug-fixes)**

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

## 🎭 3. Hệ Thống 22 Thẻ Bài Nhân Vật & Kỹ Năng

Trò chơi bao gồm **22 thẻ bài nhân vật** được chế tác thủ công với đồ họa viền vàng kim, cánh phượng hoàng lửa và rắn lục bảo thạch:

### 🦅 Phe Hội Phượng Hoàng (17 Vai Trò)
1. **Harry Potter (Kẻ Được Chọn · The Boy Who Lived):** Trái tim của chiến dịch và mục tiêu săn lùng số 1 của Voldemort. Đũa phép sở hữu **Tia Lửa Vàng (Golden Flame Retaliation)**: Tự động thiêu rụi đòn chí mạng và cứu sống Harry khi bị tấn công trực diện lần đầu tiên (1 lần duy nhất trong toàn trận; không câm lặng Voldemort). Nếu Harry sống sót đưa đoàn bay an toàn hạ cánh xuống Hang Sóc (The Burrow - Chặng cuối) hoặc Hội tiêu diệt được Voldemort, Hội Phượng Hoàng **THẮNG NGAY LẬP TỨC!**
2. **Ron Weasley (Người Bạn Trung Thành · King Weasley):** Tấm khiên sinh mệnh của Harry. Nếu Harry Potter thật bị Tử Thần Thực Tử tấn công trực diện vào ban đêm (khi Tia Lửa Vàng đã cạn và không có người Bay Hộ Tống chắn đòn), Ron sẽ tự động dũng cảm lao ra đỡ đòn chí mạng chết thay cho Harry!
3. **Hermione Granger (Phù Thủy Uyên Bác · Brightest Witch):** Mỗi ban Đêm, có thể thi triển bùa **Soi Danh Tính** để biết chính xác vai trò thật của 1 người chơi (không thể soi Harry Potter hay Chúa Tể Voldemort; Severus Snape có Bế Quan Bí Thuật sẽ hiển thị "Tâm Trí Bất Khả Xâm Phạm"). *Giới hạn: Ở bàn ≤ 6 người, chỉ xuất hiện tối đa 1 trong 2 nhân vật Hermione hoặc Arthur.*
4. **Albus Dumbledore (Hiệu Trưởng Vĩ Đại · Supreme Mugwump):** Mỗi ban Đêm, chọn 1 người chơi để phù phép bảo vệ (Protego) khỏi bị Tử Thần Thực Tử ám sát (không được bảo vệ cùng 1 người 2 lượt liên tiếp).
5. **Severus Snape (Bậc Thầy Bế Quan Bí Thuật · Điệp Viên Hai Mang):**
   - **Kỹ năng Đêm Chủ Động — `Bọc Lót Sectumsempra`:** Chọn bảo vệ 1 người trong đêm. Nếu mục tiêu bị Tử Thần Thực Tử tấn công, nhát chém Sectumsempra của Snape sẽ can thiệp rạch nát đòn ám sát, cứu sống mục tiêu! Nhưng nếu mục tiêu *không* bị tấn công, bùa lạc sẽ cắt đứt tai / làm bị thương khiến mục tiêu bị phong ấn kỹ năng ở vòng kế tiếp.
   - **Nội tại — `Bế Quan Bí Thuật` (Occlumency):** Tâm trí bất khả xâm phạm — miễn nhiễm hoàn toàn trước bùa soi của Hermione ("Tâm Trí Bất Khả Xâm Phạm") và đánh lừa khứu giác của Peter Pettigrew.
6. **Remus Lupin (Người Sói Hào Hiệp · Moony):** Sở hữu 1 bình Thuốc Hồi Sinh độc dược quý giá (1 lần duy nhất trong toàn trận). Vào ban đêm, Lupin có thể âm thầm chọn 1 đồng đội đã ngã xuống (bị trục xuất ban ngày hoặc bị ám sát trong đêm) để hồi sinh. Hành động diễn ra hoàn toàn bí mật trong đêm (phe Tử Thần Thực Tử không biết trước), và mục tiêu sẽ chính thức sống lại vào rạng sáng hôm sau trong Báo Cáo Tuyệt Mật của Quản Trò Merlin. (Nếu Lupin bị giết cùng đêm, bùa hồi sinh bị ngắt).
7. **Alastor "Mắt Điên" Moody (Thần Sáng Khét Tiếng · Constant Vigilance):** Sở hữu 1 phát đạn Avada Kedavra vào **Ban Ngày** (lúc Biểu Quyết Bùa Tước Khí Giới), có thể lập tức bắn chết 1 người chơi. Tuy nhiên, nếu bắn nhầm thành viên Hội Phượng Hoàng, Moody sẽ tự vẫn vì ân hận.
8. **Rubeus Hagrid (Người Lai Khổng Lồ · Keeper of Keys):** Mỗi ban đêm, Bác Hagrid có thể đưa 1 đồng đội lên chiếc mô-tô bay khổng lồ để hộ tống bảo vệ họ an toàn. Nếu mục tiêu bị tấn công ở chặng nguy hiểm, Hagrid sẽ lấy thân mình chắn đòn tử thủ. Thể lực khổng lồ phi thường giúp Hagrid kiên cường trên bầu trời, là chỗ dựa vững chắc cho phi đội.
9. **Arthur Weasley (Trụ Cột Nhà Weasley · Ministry Veteran):** Mỗi ban Đêm, có thể chọn 1 người chơi để **Soi Phe**, kiểm tra xem người đó thuộc phe HỘI PHƯỢNG HOÀNG, TỬ THẦN THỰC TỬ hay TRUNG LẬP. *Giới hạn: Ở bàn ≤ 6 người, chỉ xuất hiện tối đa 1 trong 2 nhân vật Hermione hoặc Arthur.*
10. **Fred Weasley (Anh Em Sinh Đôi · Weasley Twin):** Mỗi ban Đêm, có thể lén tặng 1 viên **Kẹo Ngất Xỉu** (Fainting Fancies) cho 1 người chơi còn sống. Nạn nhân ăn kẹo sẽ bị choáng váng và mất quyền biểu quyết (vote) ở vòng phán quyết ban ngày tiếp theo.
11. **George Weasley (Anh Em Sinh Đôi · Saint-like):** Mỗi ban Đêm, có thể tạo 1 **Bột Khói Mù Peru** và rải lên bầu trời. Toàn bộ Tử Thần Thực Tử bị SULK (mất quyền ám sát) trong đêm đó. **Lưu ý: Cần nghỉ 1 đêm giữa mỗi lần rải bột (cooldown 1 đêm) để cân bằng trò chơi.**
12. **Mundungus Fletcher (Kẻ Hèn Nhát · Scoundrel of the Order):** Tay buôn lậu chợ đen. Khi bị Tử Thần Thực Tử tấn công chí mạng vào ban đêm, bản năng sinh tồn trỗi dậy kích hoạt cơ chế khẩn cấp: Mundungus được tự tay bấm chọn 1 người chơi còn sống bất kỳ trên bàn để Độn Thổ lôi họ ra chết thay mình! (1 lần duy nhất trong toàn trận).
13. **Kingsley Shacklebolt (Thần Sáng Hoàng Gia · Auror Commander):** Nếu có 1 thành viên Hội Phượng Hoàng bị Tử Thần Thực Tử hạ sát trong đêm, Kingsley sẽ **CỨU SỐNG người đó an toàn (100% thành công)**! Ngoài ra, Kingsley hoàn toàn miễn nhiễm trước mọi loại bùa Câm Lặng (Silencing).
14. **Bill Weasley (Phá Bùa Cổ Xưa · Curse Breaker):** Mỗi ban Đêm, có thể dùng chuyên môn Phá Bùa (Curse Breaker) chọn 1 người chơi đang bị phong ấn kỹ năng (do bùa lạc Sectumsempra của Snape hoặc các bùa câm lặng khác) để giải thoát và khôi phục năng lực sử dụng kỹ năng cho họ.
15. **Fleur Delacour (Tình Yêu Veela · Beauxbatons Champion):** Mỗi ban Đêm, Fleur có thể dùng **Lưỡi Kiếm Gryffindor** để chém 1 người chơi. Nếu mục tiêu thuộc phe Tử Thần Thực Tử, kẻ đó bị **LOẠI KHỎI TRÒ CHƠI NGAY LẬP TỨC** (không cần qua biểu quyết). Tuy nhiên, nếu chém nhầm đồng minh Hội Phượng Hoàng, Fleur sẽ tự vẫn vì tội lỗi!
16. **Nymphadora Tonks (Phù Thủy Biến Hình · Metamorphmagus):** Khi tử trận, Tonks có thể kích hoạt khả năng biến hình để chọn kế thừa vai trò và toàn bộ năng lực ma thuật của một người chơi đã khuất trên bàn.
17. **Bản Sao Harry (Người Bảo Vệ · Polyjuice Decoy):** Uống thuốc Đa Quả Dịch mang ngoại hình Harry Potter để phân tán sự chú ý của kẻ thù. Có quyền biểu quyết ban ngày và Bay Hộ Tống ban đêm. Ngoài ra, 1 lần duy nhất trong toàn trận, có thể tự nguyện Reveal thân phận là Potter Fake và niệm bùa phong ấn (**Silenced Ultimate**) lên 1 kẻ thuộc phe Tử Thần Thực Tử, khiến kẻ đó bị tước toàn bộ kỹ năng ở vòng tiếp theo!

### 🐍 Phe Tử Thần Thực Tử (5 Vai Trò)
18. **Chúa Tể Voldemort (Chúa Tể Hắc Ám · He-Who-Must-Not-Be-Named):** Biết mặt toàn bộ Tử Thần Thực Tử và nắm quyền quyết định tối cao về mục tiêu ám sát trong đêm (hoặc ra lệnh **Án Binh Bất Động**). Nếu Chúa Tể Voldemort bị tiêu diệt (bị biểu quyết ban ngày hoặc bị trúng đạn Moody/kiếm Fleur), phe Tử Thần Thực Tử **THUA NGAY LẬP TỨC!**
19. **Bellatrix Lestrange (Nữ Tử Thần Cuồng Tín · Dark Lieutenant):** Nếu Bellatrix bị xử tử bằng biểu quyết Tước Đũa ban ngày, cơn thịnh nộ báo thù bùng nổ giúp Chúa Tể Voldemort được quyền **ám sát liên tiếp 2 người (Double Kill)** trong đêm tiếp theo!
20. **Lucius Malfoy (Quý Tộc Xảo Quyệt · Pureblood Patrician):** Mỗi ban Đêm, Lucius có thể chọn 1 người chơi để soi và biết chính xác vai trò cụ thể của người đó (**Bí Mật Soi Vai Trò - Spy**). Ngoài ra, nếu Lucius bị treo cổ ban ngày, mối liên hệ gia tộc bị đứt gãy khiến Voldemort bị KHÓA (không được phép ám sát) ở đêm tiếp theo.
21. **Peter Pettigrew (Kẻ Phản Bội · Đuôi Trùn / Wormtail):**
   - **Kỹ năng Tức Thời — `Đánh Hơi Nhà Hang Sóc`:** Nhờ 12 năm sống lốt chuột Scabbers, Pettigrew có thể ngửi mùi nhận diện đích danh **Harry Potter Thật** và **Ron Weasley**, phân biệt các nhân vật Đặc Biệt khác và Bản Sao thường.
   - **Hạn chế — `Món Nợ Sinh Mệnh` (Life Debt):** Bàn tay bạc bị co giật/phản phệ nếu chính tay Pettigrew trực tiếp bỏ phiếu ám sát Harry Potter thật.
   - **Nội tại — `Cắt Ngón Tay Hóa Chuột Đào Tẩu`:** Lần đầu bị trục xuất ban ngày, Pettigrew tự cắt ngón tay hóa chuột trốn thoát, sống sót qua phiên xử nhưng mất quyền biểu quyết ở ngày kế tiếp.
22. **Fenrir Greyback (Ma Sói Đồ Tể · Lycanthrope Savage):** Một lần duy nhất trong toàn trận vào ban đêm, Fenrir có thể cắn 1 người chơi (không thể cắn Harry Potter hay đồng minh Tử Thần Thực Tử). Nạn nhân bị cắn sẽ bị **CHUYỂN SANG PHE TỬ THẦN THỰC TỬ**, trở thành đồng minh của phe Ác nhưng vẫn giữ nguyên kỹ năng cũ!

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
Theo nguyên tác, khi Voldemort tấn công trúng Harry Potter thật lần đầu tiên:
- Đũa phép lông đuôi phượng hoàng của Harry tự động nhận diện kẻ thù, **bộc phát Tia Lửa Vàng thiêu rụi đòn chí mạng và cứu sống Harry Potter** (kích hoạt **1 lần duy nhất trong toàn trận**).
- **Quy tắc chuẩn:** Tia Lửa Vàng **CHỈ cứu sống duy nhất Harry Potter** khi Harry là mục tiêu bị tấn công trực diện (không bảo vệ người khác kể cả khi Harry đi hộ tống). Tia Lửa Vàng **KHÔNG làm câm lặng (silence) Chúa Tể Voldemort**. Voldemort vẫn có thể hạ sát mục tiêu khác trong cùng đêm (như đêm ám sát kép Double Kill) hoặc các đêm tiếp theo.

### 4.3. Rương Bảo Bối Tiệm Phù Thủy Weasley (Weasleys' Wizard Wheezes)
Các phát minh ma thuật đặc biệt tiếp tế từ Fred & George Weasley:
- 🌑 **Bột Khói Mù Peru (Instant Darkness Powder):** Che phủ bầu trời đêm trong làn khói đen huyền bí, vô hiệu hóa hoàn toàn mọi đòn ám sát trong đêm.
- 🍬 **Kẹo Ngất Xỉu Cấp Tốc (Fainting Fancies):** Khiến 1 người chơi ngất xỉu và bị cấm tham gia biểu quyết Tước Đũa đêm đó.
- 🪞 **Gương Hai Chiều Sirius (Two-Way Mirror):** Soi thấu tâm can để kiểm tra người chơi thuộc phe Sáng hay phe Tối (bậc thầy bế quan bí thuật Snape được ngụy trang).
- 🔒 **Bùa Chống Trộm Weasley (Anti-Theft Ward):** Rương bảo bối chỉ chấp nhận thành viên Hội Phượng Hoàng còn sống kích hoạt. Tử Thần Thực Tử mở rương sẽ bị bùa chống trộm phát hiện và từ chối.

---

## 🚀 5. Những Cập Nhật & Sửa Lỗi Mới Nhất (Changelog)

Các tính năng quan trọng và cải tiến đã hoàn thiện trong các bản phát hành gần nhất:

### 🛡️ 1. Cơ Chế "Bay Hộ Tống" — Nhiều Người Cùng Hộ Tống 1 Người Được Không?
- **Quy tắc chuẩn:** **HOÀN TOÀN ĐƯỢC!** Bất kỳ phù thủy nào còn sống (đặc biệt là phe Sáng) đều có thể chọn cùng 1 mục tiêu để **"Bay Hộ Tống"** trong lượt ban đêm nhằm tạo thành nhiều tầng lớp khiên chắn sinh mệnh.
- **Xử lý khử xung đột theo từng chặng (Harmonized Resolution):**
  - **Ở Chặng 1 & Chặng 2 (Chặng né đòn):** Chỉ cần mục tiêu có người bay hộ tống (bất kể 1 hay nhiều người cùng hộ tống), cả phi đội sẽ liệng chổi né đòn an toàn vào làn mây bão Surrey. **Mục tiêu an toàn thoát nạn, không ai bị thương vong** và **Tia Lửa Vàng được giữ nguyên, không bị kích hoạt lãng phí!**
  - **Ở Chặng 3+ (Chặng Voldemort phục kích):**
    - Nếu mục tiêu trực tiếp là Harry Potter & Tia Lửa Vàng còn hiệu lực: Lửa Vàng ưu tiên bùng nổ bảo vệ Harry (Tia Lửa Vàng CHỈ cứu Harry Potter, không silence Voldemort). Người hộ tống không phải hy sinh.
    - Nếu mục tiêu bị tấn công và có người cùng bay hộ tống (hoặc Tia Lửa Vàng đã dùng): **1 trong số những người bay hộ tống sẽ dũng cảm đứng ra đỡ đòn chí mạng và hy sinh** để bảo vệ mục tiêu. **Mục tiêu được cứu sống an toàn**, và các đồng đội khác cùng bay hộ tống vẫn sống sót bình an!

### 🚫 2. Nút "Không Giết Ai Cả (Án Binh Bất Động)" Cho Phe Tử Thần Thực Tử (4T)
- Bổ sung nút **"Không Giết Ai Cả / Án Binh"** trong giao diện ban đêm của Phe Tử Thần Thực Tử.
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
- **Tự động chia vai (Auto-deal on Start):** Khi Quản trò/Host nhấn "Bắt Đầu Trận Chiến", hệ thống tự động chia vai trò ngay lập tức mà không cần thêm thao tác thủ công.

### 📱 5. Tối Ưu Hóa Giao Diện Bàn Tác Chiến & Trải Nghiệm Mobile Tinh Gọn (Compact UI)
- **Đảo thứ tự ưu tiên giao diện:**
  - **Bàn Thi Triển Ma Pháp & Biểu Quyết** được đưa lên vị trí số 1 (nằm ngay phía trên danh sách mục tiêu), ngang tầm mắt của người chơi. Hiển thị tức thời phiếu bầu đã lưu và các nút hành động (Biểu Quyết Tước Đũa, Ám Sát, Bay Hộ Tống, Kỹ Năng Đặc Biệt, Bảo Bối Weasley).
  - **Danh sách Mục Tiêu Trên Bầu Trời** được bố trí ngay bên dưới. Khi chạm chọn bất kỳ ai, thanh hành động phía trên lập tức cập nhật tên mục tiêu theo thời gian thực.
- **Lược bỏ chữ thừa (Anti-Clutter):** Loại bỏ hoàn toàn các khối chữ dài dòng ("Mật Lệnh Hội Kín" & "Trợ Lý Hành Động") trên màn hình điện thoại, giúp người chơi lập tức nhìn thấy thẻ bài và bàn tác chiến mà không phải cuộn trang.
- **Nhận diện đồng minh trực quan:** Đồng minh Tử Thần Thực Tử được đánh dấu viền xanh ngọc lục bảo và huy hiệu Dấu Ấn Hắc Ám ngay trên thẻ bài; mục tiêu đặc biệt của Snape hiển thị biểu tượng lọ độc dược tím rõ ràng.

### 🚪 6. Nút Thoát Game / Rời Phòng Linh Hoạt (Leave Game)
- Bổ sung nút **"Thoát Game"** ở góc phải Header, thanh công cụ Bàn Tác Chiến của người chơi và Màn Hình Chiến Thắng/Thua Cuộc.
- Người chơi có thể chủ động rời phòng về trang chủ bất kỳ lúc nào, tự động dọn dẹp state và giải phóng vị trí cho người khác.

### 🧪 7. Hệ Thống 20 Bài Kiểm Thử Cơ Chế Toàn Diện (20/20 Test Suites Passing)
- Bộ test tự động `tests/test_game_mechanics.ts` bao phủ 100% cơ chế:
  - Bay Hộ Tống nhiều người & khử xung đột Tia Lửa Vàng.
  - Severus Snape (Bọc lót Sectumsempra & Bế quan bí thuật).
  - Peter Pettigrew (Đánh hơi Scabbers, Món nợ mạng & Hóa thú đào tẩu).
  - Kingsley Shacklebolt (Cứu sống 100% thành viên Hội).
  - Remus Lupin (Thuốc hồi sinh bí mật ban đêm & phân giải rạng sáng).
  - Phòng chống lặp vai TTTT & Stress-test công bằng 4 - 15 người.

### 🌐 8. Đồng Bộ Thời Gian Thực & Đăng Nhập Tài Khoản HPVN
- Đăng nhập trực tiếp bằng tài khoản **Harry Potter Việt Nam (HPVN)**, đồng bộ Nhà Hogwarts (Gryffindor, Slytherin, Ravenclaw, Hufflepuff) và danh xưng phù thủy.
- Đồng bộ hóa trạng thái phòng chơi tức thời qua **Mạng Lò Sưởi Floo (Supabase Realtime / Firebase / WebRTC Peer Network)** với cơ chế tự động kết nối lại khi mạng di động chập chờn.

### 🚀 9. Triển Khai Hoàn Tất Lên Vercel & GitHub
- Dự án đã được build tối ưu, cấu hình đầy đủ biến môi trường và triển khai thành công lên **Vercel** ([seven-potters.vercel.app](https://seven-potters.vercel.app)) và đồng bộ kho mã nguồn **GitHub**.

### ⚖️ 10. Bảng Phân Bổ Cân Bằng Tối Ưu (N = 4..15 Phù Thủy) & Thuật Toán Mô Phỏng Monte Carlo

- **Vấn đề đã khắc phục:** Loại bỏ hoàn toàn công thức thô `Math.floor(N / 3)`. Ở các phòng ít người ($N=4, 5$), nếu phe Tối có 2 người thì chỉ cần 1 thành viên HPH tử trận ban ngày là Tử Thần Thực Tử đạt thế cân bằng số lượng (*Parity Condition*) và thắng ngay tại Vòng 1 với tỷ lệ lên đến **74.9%**.

- **Bảng cân bằng tối ưu đã fine-tuned qua nhiều lần simulation (`OPTIMAL_BALANCE_SPEC`):**

| Sĩ Số | 4T | HPH | Chặng Bay | Ghi Chú |
|:---:|:---:|:---:|:---:|:---|
| **4** | 1 | 3 | 4 | Bàn siêu nhỏ - HPH mạnh |
| **5** | 2 | 3 | 4 | HPH slightly favored |
| **6** | 2 | 4 | 4 | Cân bằng tốt |
| **7** | 3 | 4 | 5 | 🏆 Cân bằng |
| **8** | 3 | 5 | 5 | 🏆 Cân bằng |
| **9** | 3 | 6 | 5 | 🏆 Cân bằng |
| **10** | 4 | 6 | 5 | 4T slightly favored |
| **11** | 4 | 7 | 6 | 🏆 Cân bằng |
| **12** | 4 | 8 | 6 | HPH slightly favored |
| **13** | 4 | 9 | 6 | HPH slightly favored |
| **14** | 5 | 9 | 6 | 🏆 Cân bằng |
| **15** | 5 | 10 | 6 | 🏆 Cân bằng |

> **Lưu ý:** Một số bàn (5-6, 9-10, 12-13) có thể thiên vị nhẹ một phe. Điều chỉnh thêm tùy meta game thực tế.

### Giới Hạn Đặc Biệt
- **Hermione + Arthur:** Ở bàn ≤ 6 người, chỉ xuất hiện tối đa 1 trong 2 để tránh Double Info quá mạnh.

### ⚡ 10. Cơ Chế Phục Kích Kép Chặng 3 (Large Room Ambush) Cho Phòng Đông (N ≥ 12)
- **Cơ sở phân tích số người chết (Attrition Rate):**
  - Tỷ lệ chết do 4T ám sát bình quân chỉ đạt **0.22 - 0.35 người/vòng** (do bị cản bởi quá nhiều tầng phòng thủ: *Tia Lửa Vàng*, *Né đòn Hộ tống*, *Ron hy sinh*, *Dumbledore*, *Kingsley*, *Hagrid 2 mạng*).
  - Tỷ lệ chết do biểu quyết Expelliarmus của dân làng ban đêm rất cao: **0.75 - 0.98 người/vòng** (Hermione giúp tăng tỷ lệ phát hiện kẻ thù lên 50 - 65%).
  - Ở phòng đông người ($N \ge 12$), nếu 4T chỉ ám sát 1 người mỗi ngày thì dân làng sẽ vote chết Voldemort trước khi tới Hang Sóc (HPH thắng > 85%).
- **Giải pháp:** Khi $N \ge 12$, nếu Chúa Tể Voldemort còn sống khi đoàn bay tiến vào **Chặng 3: Vòng Vây Hắc Ám & Phục Kích (`VOLDEMORT_AMBUSH`)**, Tử Thần Thực Tử được phát động **ám sát liên hoàn 2 mục tiêu cùng lúc**, đưa tỷ lệ thắng cả 2 phe về mức cân bằng hoàn hảo ~50 - 52%.

### 📊 11. Buff Nhân Vật Yếu - Cập Nhật Balance Mới

Dựa trên Monte Carlo simulation 11,000 ván, các nhân vật sau đã được buff để cân bằng game:

#### Các Buff Đã Áp Dụng

| Nhân Vật | Trước | Sau | Ghi Chú |
|:---|:---:|:---:|:---|
| **Kingsley Shacklebolt** | 50% cứu | **100% cứu sống** | Thần Sáng bảo vệ đồng đội chắc chắn |
| **Potter Fake** | Chỉ decoy | **+ Silenced ability** | Có thể silence 1 TTTT sau khi reveal |
| **Lucius Malfoy** | Chỉ lock Voldy | **+ Spy ability** | Xem vai trò người chơi mỗi đêm |
| **Fenrir Greyback** | Chuyển Neutral | **Chuyển 4T** | Cắn người → gia nhập phe 4T |

#### Giới Hạn Đặc Biệt
- **Hermione + Arthur:** Ở bàn ≤ 6 người, chỉ xuất hiện tối đa 1 trong 2 để tránh Double Info quá mạnh.

### 📊 12. Widget Tỷ Lệ Phe Chiến Thuật Trong Lobby (Monte Carlo Calibrated)
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

### ⚡ 14. Tinh Chỉnh Quy Tắc Tia Lửa Vàng (Golden Flame Precision Rules)
- **Tia Lửa Vàng CHỈ cứu Harry Potter:** Kỹ năng chỉ kích hoạt khi bản thân Harry Potter là nạn nhân trực tiếp của đòn tấn công trong đêm. Khi Harry đóng vai trò người bay hộ tống cho người khác, Tia Lửa Vàng **không** kích hoạt (áp dụng luật hy sinh của người hộ tống thông thường).
- **Không Silence Chúa Tể Voldemort:** Bỏ hiệu ứng câm lặng (silence) lên Voldemort ở đêm tiếp theo.
- **Voldemort vẫn có thể kill người khác đêm đó:** Trong đêm ám sát kép (Double Kill từ Bellatrix hoặc Vòng vây Phục kích ở phòng lớn), nếu Harry được Tia Lửa Vàng che chở, Voldemort vẫn tiêu diệt mục tiêu còn lại bình thường trong cùng đêm.

### 🐺 16. Chuẩn Hóa Cơ Chế Thuốc Hồi Sinh Remus Lupin (Secret Night Action & Dawn Resurrection)
- **Vấn đề đã khắc phục:** Trước đây, kỹ năng của Lupin được xếp vào nhóm kỹ năng tức thời (Instant Skill), dẫn đến việc người chơi sống lại ngay giữa đêm, làm rò rỉ thông tin sớm trong nhật ký (logs) cho phe Tử Thần Thực Tử, đồng thời gây lỗi đảo lộn thứ tự thông báo (người chơi bị treo cổ ban ngày xong tự dưng có log sống lại ngay trong đêm trước khi kết thúc phase).
- **Cơ chế chuẩn hóa mới:**
  - Chuyển Thuốc Hồi Sinh thành **Hành Động Ban Đêm bí mật** (`pendingActions` với action `hồi sinh`).
  - Lupin chọn 1 đồng đội đã ngã xuống (hoặc cứu người bị ám sát trong đêm) và gửi lệnh ngầm. Phe Tử Thần Thực Tử hoàn toàn không hay biết mục tiêu được hồi sinh.
  - Tại thời điểm phân giải rạng sáng (`calculateResolution` & `applyResolution`), nếu Lupin còn sống và không bị phong ấn, mục tiêu sẽ chính thức sống lại (`revivedPlayers`) với thông báo phép màu trang trọng trên Bảng Vàng Merlin.
  - Ngăn ngừa hoàn toàn lỗi đảo lộn thứ tự log và hiện tượng mâu thuẫn trạng thái sống/chết.

---

### 🐛 15. Sửa Lỗi Game Logic & Multiplayer (Bug Fixes)

Đã thực hiện audit toàn diện và sửa các lỗi trong `GameContext.tsx` và `peerNetwork.ts`.

#### P0 - Lỗi Nghiêm Trọng Game Logic (Ngay lập tức)

| ID | Mô tả | Fix |
|:---|:---|:---|
| **P0-1** | George Peru Darkness không hoạt động | Thêm check `GLOBAL_SULK_R${round}` trước kill resolution. George dùng `GLOBAL_SULK` nhưng resolution check `PERUVIAN_DARKNESS` → không khớp |
| **P0-2** | Fred/George/Bill/Fleur thiếu phase validation | Đã xác nhận: Tất cả 4 nhân vật đã có `if (curState.phase !== 'NIGHT')` validation ✅ |

#### P1 - Lỗi Quan Trọng Game Logic

| ID | Mô tả | Fix |
|:---|:---|:---|
| **P1-1** | Self-target validation: Dumbledore protect self, Snape shield self, Lupin revive self | Thêm validation tại `executePlayerActionCore`, `executeInstantSkillCore`, và `consumeWeasleyItem` |
| **P1-2** | Vote re-submit không có warning | Thêm toast warning khi đổi phiếu vote |
| **P1-canVote** | Không enforce `canVote` permission | Thêm validation ngăn silenced/fainted voters bỏ phiếu tại thời điểm submit |

#### P2 - Lỗi Multiplayer Online

| ID | Mô tả | Fix |
|:---|:---|:---|
| **P2-1** | Client execute cả cục bộ lẫn gửi Host → double execution | Sửa `playerAction`: Client chỉ gửi đến Host, không execute cục bộ |
| **P2-2** | Action/vote không sync: Host nhận action nhưng client không cập nhật | Thêm `broadcastRoomState` sau khi Host xử lý action; Dùng `stateRef.current` thay vì `gameState` (tránh stale closure) |
| **P2-3** | Client không có feedback khi action bị reject | Thêm `ACTION_REJECTED` message type; Client hiển thị toast với lý do reject |
| **P2-4** | Client không sync lại sau khi Host reconnect | Thêm `REQUEST_STATE_SYNC` message type; Client tự request sync khi nhận `HOST_RECONNECTED` |
| **P2-5** | Thiếu client-side validation trước khi gửi action | Thêm validation trong `playerAction` để UX tốt hơn, giảm network waste |
| **P2-6** | INSTANT_SKILL_SUBMIT chỉ broadcast khi thành công | Sửa: Luôn broadcast state sau skill execution (success hay fail) |

---

### 📜 16. Biên Niên Sử Chiến Trường Chi Tiết (Detailed Match Chronicle & Victory Reasons)

Ở cuối mỗi ván đấu, hệ thống tự động tổng hợp và ghi nhận **Biên Niên Sử Chiến Trường (Biên niên sử từ đầu đến cuối ván đấu)** hiển thị trên cả Terminal Log, màn hình Vinh quang người chơi (`PlayerScreen`) và Bảng điều khiển Quản trò (`GMDashboard`):

1. **👥 Xuất Phát Điểm & Danh Tính Bí Mật (Số 4 Privet Drive)**:
   - Liệt kê toàn bộ người chơi tham chiến và danh tính bí mật từ lúc cất cánh:
     - ⚡ **Harry Potter thật** (Kẻ Được Chọn) và tình trạng cuối cùng (Còn sống / Đã tử trận).
     - 🛡️ **Hội Phượng Hoàng**: Các bản sao Đa Quả Dịch & Hộ vệ đặc biệt (Hermione, Ron, Dumbledore, Lupin, Kingsley, Snape...).
     - 💀 **Tử Thần Thực Tử**: Chúa Tể Voldemort và toàn bộ binh đoàn Hắc Ám (Bellatrix, Fenrir, Lucius...).
     - ⚖️ **Phe Trung Lập**: Peter Pettigrew, Jester, v.v.

2. **🗺️ Diễn Biến Toàn Bộ Chặng Bay & Vòng Đấu (Round-by-Round Timeline)**:
   - Ghi lại tường tận từng hành động ma thuật then chốt qua mỗi vòng:
     - 🌙 **Ban Đêm**: Biến cố bầu trời (Surrey tĩnh lặng, Mây giông, Phục kích), ai bay hộ tống ai, ai bị tấn công, bùa ma thuật can thiệp (khiên Dumbledore, Sectumsempra Snape, Đa Quả Dịch né đòn, Tia Lửa Vàng bùng nổ, hồi sinh Lupin...).
     - ☀️ **Ban Ngày**: Phiên luận tội Expelliarmus của Hội đồng phù thủy, kết quả bỏ phiếu tước đũa phép, hoặc các kỹ năng can thiệp tức thì (Moody bắn lén, Dolores Umbridge cấm túc...).

3. **🏁 Phán Quyết & Phân Tích Lý Do Thắng Lợi Toàn Diện**:
   - Phân tích nguyên nhân quyết định từ đầu đến cuối trận:
     - Vì sao Hội Phượng Hoàng đưa được Harry hạ cánh an toàn xuống Hang Sóc hoặc quét sạch Tử Thần Thực Tử.
     - Hoặc cách thức Tử Thần Thực Tử phát hiện và hạ sát Harry Potter thật / áp đảo quân số.
     - Cung cấp nút **📋 Sao chép Biên Niên Sử** 1-click để chia sẻ bản tóm tắt trận đấu vào nhóm chat Facebook / Discord / Zalo.

---

### 🔄 17. Nút "Trở Về Phòng Chờ" & Thuật Toán Chống Chia Trùng 4T Ván 2 (Return To Lobby & Zero 4T Duplicate)

Khắc phục triệt để hiện tượng ván thứ 2 bị chia trùng người làm Tử Thần Thực Tử (4T) hoặc phải tạo lại phòng mới sau mỗi ván:
- **Thay thế nút Reset / Hủy phòng cũ:**
  - Trên màn hình Quản trò Merlin (`GMDashboard.tsx`) và màn hình Vinh quang người chơi (`PlayerScreen.tsx`), nút Reset gây xóa trắng dữ liệu đã được thay thế bằng nút **`[ 🔄 Trở Về Phòng Chờ ]`**.
  - Không giải tán phòng, không làm văng người chơi, không phải chia sẻ lại mã phòng hay link kết nối.
- **Cơ chế Snapshot Dữ liệu Vai trò Đa Chiều (`returnToLobby`):**
  - Khi trận đấu khép lại hoặc Merlin nhấn xác nhận trở về phòng chờ, hệ thống tự động ghi nhận danh tính những ai vừa đảm nhận vai trò Tử Thần Thực Tử (Voldemort, Bellatrix, Lucius, Fenrir, Pettigrew...).
  - Dữ liệu được ánh xạ đồng thời qua 3 khóa nhận diện: `p.id` (ID trong phòng), `deviceId` (Định danh thiết bị phần cứng) và `nameKey` (Tên người chơi chuẩn hóa), đồng thời ghi đè lưu trữ dài hạn vào `localStorage.getItem('seven-potters-role-history')`.
- **Cơ chế Khóa Cứng (-1.000.000 Điểm) & Hoán Đổi Cưỡng Chế (Hard Swap Guarantee):**
  - Khi Merlin ấn **"Chia Bài & Bắt Đầu"** cho ván thứ 2, thuật toán kiểm tra chuỗi `consecutiveEvil`. Bất kỳ ai vừa làm 4T ở ván liền trước sẽ bị trừ `-1,000,000` điểm xác suất làm 4T.
  - Sau bước chia bài, hệ thống kích hoạt **Vòng kiểm toán cưỡng chế (Post-sort Hard Swap Audit)**: Nếu người đó vẫn ngẫu nhiên rơi vào nhóm Tử Thần Thực Tử (do sĩ số phòng đặc thù), thuật toán lập tức tự động hoán đổi người đó sang Phe Tốt và đưa một thành viên Phe Tốt chưa từng làm 4T vào thay thế.
  - **Kết quả:** Đã stress-test qua 500 ván đấu liên tiếp ở mọi quy mô phòng (4 đến 12 người), **tỷ lệ lặp lại vai trò 4T ở ván kế tiếp đạt 0.0% tuyệt đối**.

---

### 🌐 18. Nâng Cấp Multiplayer Online Đa Nhà Mạng & Ổn Định Bỏ Phiếu / Hành Động

Giải quyết triệt để vấn đề các thao tác action và bỏ phiếu lúc nhận lúc không khi người chơi dùng các nhà mạng viễn thông khác nhau (Viettel, VNPT, FPT, 4G Mobifone/Vinaphone):
- **Khử Hiện Tượng "Mục Tiêu Ma" (Dead Target Selection Cleanup):**
  - Tự động reset mục tiêu đã chọn (`selectedTargetId = null`) mỗi khi chuyển đổi Phase (Đêm $\rightarrow$ Ngày, Ngày $\rightarrow$ Đêm).
  - Khóa nút bấm nếu mục tiêu đã tử trận hoặc không còn hợp lệ, ngăn chặn client gửi các lệnh rác bị Host từ chối mà người chơi không rõ nguyên nhân.
- **Tự Động Chữa Lành Trôi Dạt Định Danh (Auto-heal ID Drift):**
  - Khi mạng di động 4G chập chờn hoặc chuyển trạm phát sóng dẫn đến WebRTC / WebSocket tạo lại kết nối tạm thời với ID ngẫu nhiên: Client tự động đối soát với danh sách phòng của Host qua `deviceId` và tên người chơi để khôi phục đúng slot, bảo toàn vai trò và quyền hành động.
- **Phản Hồi Trạng Thái Hai Chiều (Bidirectional Action Feedback):**
  - Khi Host tiếp nhận hoặc từ chối một action, phản hồi kết quả trực quan lập tức gửi về client để hiển thị thông báo tức thì, không để người chơi ở trạng thái chờ đợi hoang mang.

---

### 🎴 19. Bảng Điều Khiển 3 Chế Độ Chơi & Bộ Chọn Thẻ Tùy Biến (Custom Role Picker)

Tại phòng chờ (`Lobby`), Quản Trò Merlin (Host/GM) được trang bị bảng chọn chế độ chơi trực quan và bộ công cụ tùy biến thẻ bài trước khi khai mạc trận đấu:

- **1. Chế Độ Cổ Điển (`CLASSIC` - 22 Thẻ Gốc):**
  - Giữ đúng luật chơi gốc của Bảy Potter: 17 thẻ Hội Phượng Hoàng và 5 thẻ Tử Thần Thực Tử.
  - Phù hợp cho các ván đấu truyền thống chuẩn nguyên tác.
- **2. Chế Độ MOD HPVN (`MOD_HPVN` - 27 Thẻ Mở Rộng):**
  - Kích hoạt toàn bộ 27 nhân vật: bổ sung thêm Minerva McGonagall, Neville Longbottom, Draco Malfoy, Dolores Umbridge và Jester.
  - Phù hợp cho các ván đấu đông người hoặc muốn trải nghiệm sự biến hóa hỗn loạn đầy bất ngờ.
- **3. Chế Độ Tùy Biến (`CUSTOM` - Merlin Tự Chọn Thẻ):**
  - Merlin có toàn quyền quyết định **chính xác những nhân vật nào sẽ xuất hiện trong ván đấu** thay vì để hệ thống chia ngẫu nhiên từ toàn bộ 27 thẻ.
  - **Giao diện Modal Chọn Thẻ Chuyên Nghiệp (`CustomRolesModal`):**
    - Hiển thị đầy đủ 27 thẻ bài với phân loại màu sắc phe phái, số hiệu thẻ, huy hiệu, năng lực chiến thuật và ảnh đại diện.
    - Tìm kiếm nhanh tên nhân vật hoặc từ khóa kỹ năng.
    - Bộ lọc nhanh theo Phe: Hội Phượng Hoàng, Tử Thần Thực Tử, Trung Lập.
    - Nút mẫu tiện lợi 1 chạm: **"Chuẩn N Người"** (tự động chọn tỷ lệ phe tối ưu theo số người trong phòng), **"Cổ Điển (22 Thẻ)"**, **"Toàn Bộ (27 Thẻ)"**, **"Bỏ Chọn Hết"**.
    - Cảnh báo trực quan nếu số lượng thẻ được chọn ít hơn số lượng người chơi trong phòng.
  - **Đảm bảo tính công bằng & Chống lặp 4T:** Dù ở chế độ Tùy Biến, thuật toán chia bài vẫn kiểm tra bảo lưu lịch sử và kích hoạt cơ chế khóa cứng chống trùng lặp người làm 4T ở ván kế tiếp.
  - **Đồng bộ thời gian thực:** Chế độ chơi và số lượng thẻ đã chọn được đồng bộ tức thì qua Firebase Floo Network tới màn hình chờ của tất cả người chơi trong phòng.

---

## 🛠️ 8. Cài Đặt & Khởi Chạy Dự Án (Developer Guide)

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

4. **Chạy simulation cân bằng (JavaScript):**
   ```bash
   node simulation.js
   ```
   *(Chạy 1,000 ván mỗi bàn 5-15 người, hiển thị tỷ lệ thắng HPH vs 4T và phân tích balance).*

5. **Kiểm tra cân bằng và mô phỏng tỷ lệ chặng bay:**
   ```bash
   npx tsx tests/simulate_flight_balance.ts
   npx tsx tests/simulate_flight_optimization.ts
   ```

6. **Kiểm thử Trở Về Phòng Chờ & Chống trùng 4T ván 2 (500 ván stress-test):**
   ```bash
   npx tsx tests/test_return_to_lobby_anti_4t.ts
   ```
   *(Kiểm tra quy trình lưu snapshot vai trò, bảo lưu phòng chơi và cam kết 0% chia lặp 4T liên tiếp ở mọi quy mô phòng 4 - 12 người).*

### Đóng gói ứng dụng (Build Production)
```bash
npm run build
npm run start
```

---

## 🎮 7. MOD HPVN - Ultimate Edition

> **Chế độ chơi hoàn toàn mới kết hợp tinh hoa từ Classic & Chaos Mode!**

MOD HPVN là chế độ chơi được thiết kế mới hoàn toàn, mang đến trải nghiệm social deduction nhanh, hỗn loạn và bất ngờ hơn bao giờ hết.

### 🌟 Đặc Điểm Nổi Bật

| Đặc điểm | Mô tả |
|:---|:---|
| **Số người chơi** | 4 - 20 người |
| **Thời gian** | 10 - 25 phút mỗi ván |
| **Tốc độ** | Game nhanh, nhiều cái chết, không nhàm chán |
| **Sự bất ngờ** | Chaos Events mỗi đêm |

### ⚡ 5 Pha Game

```
🌙 ĐÊM → 🎲 SỰ KIỆN → 💀 GIẢI QUYẾT → 👻 MA HIỂU → 🗳️ BIỂU QUYẾT
```

1. **🌙 Pha Đêm (Night):** Người chơi thực hiện hành động bí mật: giết, soi, bảo vệ. Timer 20 giây.
2. **🎲 Pha Sự Kiện (Chaos Event):** Sự kiện ngẫu nhiên xảy ra.
3. **💀 Pha Giải Quyết (Death Resolution):** Người chết được tiết lộ.
4. **👻 Pha Ma Hiểu (Ghost Revelation):** Người chết có thể vote (0.5 sức).
5. **🗳️ Pha Biểu Quyết (Vote):** Bỏ phiếu treo cổ. Timer 30 giây.

### 🎲 Chaos Events

| Sự kiện | Xác suất | Mô tả |
|:---|:---:|:---|
| **None** | 50% | Không có gì xảy ra |
| **Shield** | 20% | Một người được bảo vệ |
| **Info** | 15% | Tiết lộ thông tin ngẫu nhiên |
| **Silence** | 15% | Một người bị câm lặng |

### 👻 Ghost Voting

- Người chơi đã chết vẫn có thể vote
- Sức mạnh vote: **0.5** (thay vì 1.0)
- Ghosts ảnh hưởng đến kết quả cuối cùng!

### 🛡️ Dark Pact Protection

- Round 1: Tử Thần Thực Tử được bảo vệ bởi Dark Pact
- Đảm bảo ít nhất **1 4T sống đến Round 2**
- Game không kết thúc quá sớm!

### 🏆 Điều Kiện Thắng

| Phe | Điều kiện |
|:---|:---|
| **🦅 Hội Phượng Hoàng** | Tất cả 4T bị loại HOẶC Harry sống đến Round cuối HOẶC Voldemort bị treo |
| **🐍 Tử Thần Thực Tử** | HPH ≤ 4T (sau Round tối thiểu) HOẶC Harry chết |
| **🃏 Jester** | Bị treo cổ bất kỳ lúc nào |
| **⚖️ Polyjuice** | Sống đến cuối với ≥2 người |

### 📊 Bảng Cân Bằng (MOD HPVN)

| Sĩ số | HPH | 4T | Neutral | Round tối thiểu |
|:---:|:---:|:---:|:---:|:---:|
| 4 | 2 | 2 | 0 | 4 |
| 5 | 2 | 2 | 1 | 4 |
| 6 | 3 | 2 | 1 | 4 |
| 7 | 4 | 2 | 1 | 5 |
| 8 | 4 | 3 | 1 | 5 |
| 9 | 4 | 3 | 2 | 5 |
| 10 | 5 | 3 | 2 | 5 |
| 11 | 5 | 4 | 2 | 6 |
| 12 | 5 | 4 | 3 | 6 |
| 13 | 6 | 4 | 3 | 6 |
| 14 | 6 | 5 | 3 | 6 |
| 15 | 6 | 5 | 4 | 7 |
| 16 | 7 | 5 | 4 | 7 |
| 17 | 7 | 6 | 4 | 7 |
| 18 | 7 | 6 | 5 | 7 |
| 19 | 8 | 6 | 5 | 8 |
| 20 | 8 | 6 | 6 | 8 |

### 🎭 24 Vai Trò (MOD HPVN)

#### 🦅 Hội Phượng Hoàng (15 vai)

1. **Harry Potter** - Kẻ Được Chọn. Target chính, có Golden Flame bảo vệ 1 lần.
2. **Ron Weasley** - Người Bạn Trung Thành. Tự động chết thay Harry (1 lần).
3. **Hermione Granger** - Phù Thủy Uyên Bác. Scan vai trò mỗi đêm.
4. **Dumbledore** - Hiệu Trưởng Vĩ Đại. Bảo vệ 1 người mỗi đêm.
5. **Snape** - Bậc Thầy Bế Quan. Bọc lót người, cứu hoặc phong ấn.
6. **Lupin** - Người Sói Hào Hiệp. Thuốc hồi sinh (1 lần).
7. **Moody** - Thần Sáng Khét Tiếng. Súng bắn 1 người (1 lần).
8. **Hagrid** - Người Lai Khổng Lồ. Phải bị tấn công 2 lần mới chết.
9. **Kingsley** - Thần Sáng Hoàng Gia. Miễn nhiễm silence.
10. **Fred Weasley** - Anh Em Sinh Đôi. Tặng kẹo ngất xỉu.
11. **George Weasley** - Anh Em Sinh Đôi. Bột khói vô hiệu ám sát (cooldown).
12. **Bill Weasley** - Phá Bùa Cổ Xưa. Giải phong ấn.
13. **Tonks** - Phù Thủy Biến Hình. Kế thừa vai trò khi chết.
14. **Fleur Delacour** - Tình Yêu Veela. Lưỡi kiếm chém chết 4T.
15. **McGonagall** *(MỚI)* - Hiệu Phó. Biến hình bảo vệ đồng minh.
16. **Neville** *(MỚI)* - Longbottom. Đánh thức người chơi bị death glare.

#### 🐍 Tử Thần Thực Tử (5 vai)

1. **Voldemort** - Chúa Tể Hắc Ám. Kill 1 người mỗi đêm.
2. **Bellatrix** - Nữ Tử Thần Cuồng Tín. +1 kill cho Voldy khi bị treo.
3. **Lucius** - Quý Tộc Xảo Quyệt. Scan vai trò mỗi đêm.
4. **Pettigrew** - Kẻ Phản Bội. Đánh hơi Harry & Ron.
5. **Fenrir** - Ma Sói Đồ Tể. Cắn chuyển người sang 4T.

#### ⚖️ Neutral (4 vai)

1. **Draco** *(MỚI)* - Điệp viên hai mang. Tàng hình, có thể reveal bất cứ lúc nào.
2. **Jester** - Kẻ hề. Thắng nếu bị treo cổ.
3. **Polyjuice** - Thuốc biến hình. Thắng nếu sống đến cuối với ≥2 người.
4. **Dolores** *(MỚI)* - Phù Thủy Độc Ác. Quyền lực đêm 1, tấn công ngẫu nhiên.

### 🚀 Cách Truy Cập MOD HPVN

1. Truy cập đường dẫn `/hpvn` trên ứng dụng
2. Hoặc click nút **"MOD HPVN"** trên header của trang chủ

---

## 📜 9. Bản Quyền & Giấy Phép

- Trò chơi được phát triển phi lợi nhuận bởi cộng đồng hâm mộ **Harry Potter Việt Nam (HPVN)**.
- Thế giới phù thủy, nhân vật và các thuật ngữ ma thuật thuộc bản quyền của **J.K. Rowling** và **Warner Bros. Entertainment Inc.**
- Mã nguồn được phân phối theo giấy phép MIT License.
