# ⚡ Hogwarts Lego 3D Duel · Harry Potter vs Lord Voldemort

> **CLB Đấu Tay Đôi Hogwarts 3D** — Trò chơi đấu pháp thuật thời gian thực chuẩn phong cách Lego Minifigure trên nền web, xây dựng bằng **Three.js (hỗ trợ WebGPU với WebGL2 Fallback)** và **TypeScript / Vite**.

![Avada Kedavra Showcase](./docs/screenshots/reference_matching_avada.png)

---

## 🌟 Điểm nổi bật & Tính năng chính

### 1. Đồ hoạ cao cấp với Post-Processing (PBR + Bloom)
- **UnrealBloomPass** cho hiệu ứng glow phép thuật - tia phép Expelliarmus và Avada Kedavra có ánh sáng neon rực rỡ
- **PBR Materials** cho nhân vật Lego với clearcoat và metallic
- **Dynamic Lighting** với 3-point studio lighting + candlelight atmosphere
- **Procedural Textures** 1024x1024 cho face decals và costume

### 2. Góc nhìn đa chế độ (Multi-Camera System)
- **4 chế độ camera** tự động chuyển theo thiết bị và hướng màn hình:
  - **Cinematic** (Desktop mặc định): Góc nhìn khán giả từ phía sau vai Harry Potter, điện ảnh và dramatic
  - **Side** (Desktop bấm C): Góc 90° từ hàng ghế khán giả - dễ nhìn đạn phép bay tới
  - **Mobile** (Mobile landscape): Tối ưu cho màn hình ngang - nhìn rõ cả 2 nhân vật
  - **Portrait** (Mobile dọc): Góc top-down từ trên cao - tối ưu cho chơi ngón tay
- Camera tự động phát hiện thiết bị và hướng màn hình khi khởi động
- Bấm **C** để chuyển qua lại giữa 4 góc nhìn
- Hàng ghế khán giả với các học sinh Lego thuộc 4 nhà Hogwarts ngồi theo dõi

### 3. Cơ chế né đòn cố định (Locked Stance & Kinematic Dodge)
Hai đấu sĩ đứng nghiêm trang tại vạch đấu của mình và **không di chuyển tự do khắp phòng**. Thay vào đó, kỹ năng sống còn nằm ở khả năng phán đoán thời điểm và nghiêng/cúi người né đòn:
- **Nghiêng người sang trái / phải (`A` / `D`)**: Nghiêng hông và uốn thân trên để né các tia phép bắn thẳng.
- **Cúi thấp người né (`S` / `Space`)**: Hạ thấp trọng tâm và gập gối để tránh các đòn đánh tầm cao.
- **Hệ thống Hitbox né đòn**: Khi nghiêng hoặc cúi né đúng thời điểm tia phép của đối thủ tới gần, hệ thống hiển thị `NÉ THÀNH CÔNG (DODGE)!` và triệt tiêu toàn bộ sát thương.
- **AI Voldemort thông minh**: Đối thủ AI tự động quan sát đường bay phép thuật của bạn và phản xạ nghiêng hoặc cúi người né đòn tương ứng.

### 4. Kho thần chú - 13 Bùa Phép Harry Potter (Spell Arsenal)

Hệ thống 13 bùa phép được phân thành 2 vòng trên HUD:
- **Vòng trong (1-5):** 5 bùa phép cơ bản thiết yếu
- **Vòng ngoài (6-0, -, =, P):** 8 bùa phép nâng cao từ Harry Potter canon

| Phím tắt | Thần chú | Màu sắc / Hiệu ứng | Sát thương | Mô tả chiến thuật |
| :---: | :---: | :---: | :---: | :--- |
| **`1`** | **Expelliarmus** | Đỏ tươi (*Scarlet*) | 25 | Bùa Tước Khí Giới cổ điển, tốc độ bay nhanh, phá thế đối thủ. |
| **`2`** | **Protego** | Xanh dương ánh bạc (*Cerulean*) | 0 | Khiên chắn ma thuật đa giác, chặn hoàn toàn sát thương phép trong thời gian hiệu lực. |
| **`3`** | **Incendio** | Cam lửa bộc phá (*Firestorm*) | 35 | Cầu lửa nổ lan diện rộng, gây sát thương thiêu đốt mạnh. |
| **`4`** | **Stupefy** | Đỏ bộc phá (*Stun Crimson*) | 18 | Bùa Choáng với lực đẩy giật lùi, khiến đối thủ khựng lại. |
| **`5` / `K`** | **Avada Kedavra** | Lục bảo tử thần (*Emerald Lightning*) | **70** | **Lời Nguyền Chết Chóc**: Tia chớp lục bảo kết nối trực tiếp đầu đũa phép với mục tiêu, kèm đầu lâu khói Tử Thần Thực Tử (*Morsmordre*) lơ lửng giữa bàn đấu. |
| **`6`** | **Sectumsempra** | Đỏ thẫm (*Dark Crimson*) | **40** | **Lời Nguyền Máu Chảy**: Tạo vết cắt vô hình khiến đối thủ chảy máu liên tục. |
| **`7`** | **Petrificus Totalus** | Xám bạc (*Silver Gray*) | 0 | **Bùa Trói Toàn Thân**: Đông cứng hoàn toàn đối thủ trong 3 giây, không thể thi triển phép. |
| **`8`** | **Confringo** | Cam rực (*Blazing Orange*) | **45** | **Bùa Nổ Tan**: Bong bóng nổ lan trên bề mặt đối thủ gây sát thương bùng nổ. |
| **`9`** | **Immobulus** | Băng xanh (*Ice Blue*) | 0 | **Bùa Đóng Băng**: Đóng băng đối thủ hoàn toàn trong 2.5 giây. |
| **`0`** | **Morsmordre** | Lục nhạt (*Pale Green*) | 0 | **Dấu Hiệu Tử Thần**: Hiệu ứng khói xanh đặc trưng, tăng 25% sát thương trong 5 giây. |
| `-`** | **Levicorpus** | Tím than (*Violet*) | 15 | **Bùa Treo Ngược**: Móc nối treo đối thủ lơ lửng, giảm khả năng đánh phản xạ. |
| `=` | **Obliviate** | Xanh cyan (*Cyan*) | 0 | **Bùa Xóa Ký Ức**: Xóa trí nhớ đối thủ, giảm 30% độ chính xác trong 4 giây. |
| **`P`** | **Expecto Patronum** | Bạc tinh khiết (*Pure Silver*) | **55** | **Bùa Triệu Hồi Patronus**: Ánh sáng tinh khiết mạnh mẽ nhất, hiệu ứng hào quang bạc rực rỡ. |

### 5. Đọ đũa phép (Priori Incantatem / Spell Clash)
Khi hai tia phép của Harry và Voldemort va chạm trực diện giữa không trung, trận đấu sẽ kích hoạt chế độ **Đọ Phép Lực (Spell Clash)**:
- Hạt năng lượng ánh sáng bùng nổ tại tâm điểm va chạm.
- Người chơi liên tục nhấp chuột hoặc bấm phím để đẩy luồng năng lượng về phía đối thủ giành chiến thắng.

---

## 🎮 Hướng dẫn điều khiển (Controls)

| Phím / Thao tác | Hành động |
| :--- | :--- |
| **`A`** hoặc **`ArrowLeft`** | Nghiêng người sang trái để né đòn |
| **`D`** hoặc **`ArrowRight`** | Nghiêng người sang phải để né đòn |
| **`S`** / **`Space`** / **`ArrowDown`** | Cúi thấp người hạ trọng tâm né phép |
| **`1`** | Thi triển *Expelliarmus* (25 sát thương) |
| **`2`** | Kích hoạt khiên chắn *Protego* |
| **`3`** | Thi triển *Incendio* (35 sát thương) |
| **`4`** | Thi triển *Stupefy* (18 sát thương + choáng) |
| **`5`** hoặc **`K`** | Thi triển *Avada Kedavra* (**70 sát thương**) |
| **`6`** | Thi triển *Sectumsempra* (**40 sát thương**) |
| **`7`** | Thi triển *Petrificus Totalus* (trói 3s) |
| **`8`** | Thi triển *Confringo* (**45 sát thương**) |
| **`9`** | Thi triển *Immobulus* (đóng băng 2.5s) |
| **`0`** | Thi triển *Morsmordre* (+25% damage 5s) |
| `-`** | Thi triển *Levicorpus* (15 sát thương) |
| `=` | Thi triển *Obliviate* (-30% accuracy 4s) |
| **`P`** | Thi triển *Expecto Patronum* (**55 sát thương**) |
| **Chuột trái (Click)** | Nhấp vào các biểu tượng thần chú trên vòng tròn HUD góc phải |

---

## 🛠️ Công nghệ & Cấu trúc dự án

### Core Engine & Graphics
- **Three.js r186** (hỗ trợ WebGPU / WebGL2 Fallback tự động)
- **Post-Processing Pipeline**: EffectComposer → RenderPass → UnrealBloomPass → OutputPass
- **PBR Materials**: MeshPhysicalMaterial với clearcoat, metalness, và emissive
- **Procedural Textures**: Canvas-based 1024x1024 decals cho Lego characters

### Game Constants (TypeScript)
```typescript
const SPELL_DAMAGE = { EXPELLIARMUS: 25, PROTEGO: 0, INCENDIO: 35, STUPEFY: 18, AVADA_KEDAVRA: 70 }
const PLAYER_STATS = { MAX_HP: 100, MATCH_DURATION: 90, SHIELD_DURATION: 2.5, STUN_DURATION: 2.0 }
const VFX = { PARTICLE_COUNT: 400, SHOCKWAVE_POOL_SIZE: 8 }
```

### Audio
- **Web Audio API Procedural Synthesis** (tổng hợp sóng âm thanh đũa phép và bùa chú chân thực mà không cần nạp asset audio nặng)

### Cấu trúc thư mục
```
hogwarts-duel-3d/
├── index.html                   # HTML entry & giao diện HUD Glassmorphism
├── package.json                 # Dependencies & build scripts
├── tsconfig.json                # Cấu hình TypeScript
├── vite.config.ts              # Cấu hình Vite build
├── docs/
│   ├── screenshots/            # Ảnh chụp thực tế các góc chơi và kỹ năng
│   └── bloom-architecture.html   # Architecture diagram cho Bloom Post-Processing
└── src/
    ├── dueling.ts              # Game engine chính (5286 dòng)
    │                            # - MagicAudio: Procedural sound synthesis
    │                            # - SpellGesture: Spell definitions & constants
    │                            # - HogwartsSinglePlayerGame: Main game class
    │                            # - EffectComposer + UnrealBloomPass setup
    ├── lego_character.ts       # Lego Minifigure procedural model
    ├── dueling_stage.ts        # Hogwarts Great Hall 2.5D diorama
    ├── dueling.css             # HUD Glassmorphism styles
    └── vite-env.d.ts           # TypeScript declarations
```

---

## 🔧 Bug Fixes & Improvements (v1.1)

### Đã sửa
- ✅ **Initialization Order**: `buildSkeletalCharacters()` phải gọi TRƯỚC `buildCastVfx()` để `playerLego` tồn tại
- ✅ **GLTF Error Handling**: Thêm `onError` callback và `loadTextureWithFallback()` cho asset loading
- ✅ **Null Safety**: Thêm `resizeHandler` cleanup, optional chaining cho `clock`, `beforeunload` cleanup
- ✅ **Avada Kedavra Balance**: Giảm damage từ 100 → 70 (yêu cầu 2 hits thay vì instant kill)

### Tính năng mới
- ✨ **Bloom Post-Processing**: UnrealBloomPass cho hiệu ứng glow phép thuật
- ✨ **Dynamic Bloom Flash**: Auto-trigger bloom khi spell impact (Avada: 2.5x, Incendio: 2.0x)
- ✨ **Game Constants**: TypeScript constants cho spell damage, player stats, VFX settings
- ✨ **Memory Leak Prevention**: Cleanup event listeners và renderer dispose

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu môi trường
- **Node.js**: >= 18.0.0
- **npm** hoặc **pnpm** / **yarn**

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ hiển thị trong terminal (mặc định: `http://localhost:5180`).

### 4. Build sản phẩm (Production Build)
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo ra với code đã được tối ưu và đóng gói hoàn chỉnh.

### 5. Xem trước bản build
```bash
npm run preview
```

---

## 📊 Performance Tips

| Setting | FPS Impact | Recommendation |
|---------|------------|----------------|
| Bloom Strength 0.8 | ~5% | Default |
| Bloom Strength 1.5 | ~10% | High quality |
| Particle Count 400 | ~3% | Default |
| Shadow Mapping | ~8% | Enable on desktop |

---

## 📜 Giấy phép
Dự án được phát triển phục vụ mục đích học tập, trình diễn đồ họa WebGPU / Three.js 3D và giải trí.
Học viện Hogwarts, Harry Potter và thế giới phù thủy thuộc bản quyền của J.K. Rowling và Warner Bros. Entertainment Inc.
Phong cách mô hình đồ chơi thuộc bản quyền của The LEGO Group.
