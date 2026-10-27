# Design collaboration record

Input revision: `c309a0e` (before this redesign).

Source: Gemini API, `models/gemini-3.5-flash`, 26 October 2026. The request included the current application source and clean desktop/mobile screenshots. The API returned a complete response (`STOP`). The original proposal follows; its suggestions and accessibility estimates are design input, not test results.

Implemented direction: compact studio, Products / Layout / Brand tabs, mobile Edit/Preview switch, persistent save status, larger controls, inline upload/storage errors. The implementation also provides a working zoom selector and undo for the last deletion. Existing catalog data, six layouts, color palettes, offline fonts, and A4 export are retained.

---

# UX/UI Review & Redesign Proposal — VERDANT Medical Catalog Studio

ในฐานะ Senior Product Designer ได้ทำการวิเคราะห์ UX/UI และโครงสร้างโค้ดปัจจุบัน (HTML/CSS/JS) พร้อมภาพหน้าจอ desktop/mobile เพื่อเสนอแนวทางการปรับปรุงระบบสู่ **VERDANT Studio Next-Gen** โดยมุ่งเน้นการเป็น "เครื่องมือทำงาน (SaaS Utility)" ที่ยืดหยุ่น รวดเร็ว อ่านง่าย และทำงานได้สมบูรณ์ทั้งบน Desktop และ Mobile

---

## 1. วิจารณ์ปัญหาปัจจุบัน (Current Pain Points)

เรียงตามระดับผลกระทบต่อผู้ใช้งาน (Impact Level):

1. **[Critical] ส่วน Hero Banner แย่งพื้นที่ทำงาน (Layout & Scroll Depth)**
   - *ปัญหา:* ส่วน `.intro` สูงถึง 318px+ บน Desktop (1440×900) เมื่อรวมกับ Header ทำให้พื้นที่แก้ไขข้อมูล (Editor) และ Preview ถูกดันลงไปใต้จอ ต้องเลื่อนจอลงทุกครั้งก่อนเริ่มทำงาน
   - *ผลกระทบ:* ผู้ใช้รู้สึกเหมือนอยู่บน Landing Page ขายของ ไม่ใช่ Studio ทำงานจริง

2. **[Critical] Mobile Experience ต้อง Scroll ยาวมากเพื่อดู Preview**
   - *ปัญหา:* บน Mobile จอภาพแสดงผลเรียง Sidebar ลงมาก่อน Preview ทั้งหมด ผู้ใช้ต้องเลื่อนผ่านแบบฟอร์มยาวเหยียดเพื่อไปดูผลลัพธ์กระดาษ A4
   - *ผลกระทบ:* ขาดการป้อนข้อมูลแบบ Real-time Feedback บนมือถือ

3. **[High] ลำดับความสำคัญของสถาปัตยกรรมข้อมูล (Information Architecture - IA)**
   - *ปัญหา:* แผงควบคุมจัดเรียง 01 แบรนด์ → 02 สไตล์ → 03 สินค้า ทั้งที่งานหลักของผู้ใช้คือ "การเพิ่ม/แก้ไขสินค้า" (Task-Centric)
   - *ผลกระทบ:* ผู้ใช้เสียเวลาเลื่อนขึ้นลงเพื่อสลับการกรอกสินค้าและการปรับสไตล์

4. **[High] Accessibility & Touch Target ไม่ผ่านเกณฑ์มาตรฐาน**
   - *ปัญหา:*
     - ปุ่มจัดลำดับสินค้า (`[data-move]`) มีขนาดเพียง 28×28px (มาตรฐาน Touch Target คือ 44×44px)
     - ข้อความ Label และ Caption บางจุดเล็กเพียง 7–11px
     - Contrast Ratio ข้อความสีเทาอ่อน `#697d72` บนพื้นหลัง `#f3f6f1` ต่ำกว่าเกณฑ์ 4.5:1
     - Input Font Size ใน CSS เดิมบางส่วนเท่ากับ 12px/14px ทำให้ iOS Safari ซูมหน้าจออัตโนมัติขณะพิมพ์

5. **[Medium] การแจ้งเตือนและ Error Handling ใช้งานระบบ Native Alert**
   - *ปัญหา:* การอัปโหลดรูปผิดขนาดหรือพื้นที่ storage เต็ม ใช้ `alert()` แบบป๊อปอัปขัดจังหวะการทำงาน และสถานะบันทึก `#status` ซ่อนอยู่ด้านล่างสุดของแผงแก้ไข

6. **[Medium] ความสับสนของพฤติกรรม Preview และการพิมพ์ A4**
   - *ปัญหา:* ใน Preview Toolbar มีป้ายกำกับ "LIVE" และ "A4 210x297มม." แต่ไม่มีตัวควบคุม Zoom/Fit to Screen และไม่มีคำเตือนเมื่อข้อมูลสินค้ายาวเกินหน้ากระดาษ A4 ใบแรก

---

## 2. ทิศทางดีไซน์ (Design Directions)

* **Direction A: "Compact Studio Workspace" (เลือกแนวทางนี้)**
  - ย่อ Header/Hero ให้กลายเป็น Studio Bar กะทัดรัด
  - จัดกลุ่มเครื่องมือเป็น Tab Navigation: `[ 📦 สินค้า ]` `[ 🎨 สไตล์และแม่แบบ ]` `[ 🏢 ข้อมูลแบรนด์ ]`
  - มี Sticky Switcher บน Mobile: `[ ✏️ แก้ไข ]` vs `[ 👁️ ดูตัวอย่าง ]`
  - *เหตุผล:* เหมาะกับแอปพลิเคชันทำงานแบบ Utility, เพิ่มพื้นที่ใช้งานเห็นผลลัพธ์ทันทีโดยไม่ต้องเปลี่ยนโครงสร้าง JS หลัก

* **Direction B: "Multi-step Wizard Flow" (ไม่เลือก)**
  - แบ่งทีละขั้นตอน Step 1 -> Step 2 -> Step 3
  - *เหตุผล:* ลดทอนความสามารถในการปรับแต่งแบบ Real-time และขัดกับพฤติกรรมผู้ใช้ที่ต้องการลองเปลี่ยนสี/เลย์เอาต์สลับกับการดูผลลัพธ์ทันที

---

## 3. Structure & Wireframes

### LTR Workspace & Workflow Alignment
```
[ เพิ่ม/แก้ไขสินค้า (Main Task) ] ──> [ เลือกแม่แบบ & ชุดสี ] ──> [ ตรวจความถูกต้องใน Preview ] ──> [ ส่งออก PDF A4 ]
```

### Desktop Wireframe (1440×900 Viewport)
```
+---------------------------------------------------------------------------------------------------+
| [🟢 VERDANT Studio]   ชื่อแคตตาล็อก: [ Precision in care... ]    [🟢 บันทึกแล้ว]   [ 🖨️ ส่งออก PDF A4 ] |
+---------------------------------------------------+-----------------------------------------------+
|  SIDEBAR PANELS (Width: 360px)                    |  LIVE PREVIEW STAGE (Flex: 1)                 |
|  +---------------------------------------------+  |  +-----------------------------------------+  |
|  | [ 📦 สินค้า (2) ]  [ 🎨 สไตล์ ]  [ 🏢 แบรนด์ ] |  |  | Toolbar: [👁️ A4 Live Preview] [🔍 100%] |  |
|  +---------------------------------------------+  |  +-----------------------------------------+  |
|  | + เพิ่มสินค้าใหม่                             |  |  |                                         |  |
|  | ------------------------------------------- |  |  |  +-----------------------------------+  |  |
|  | [🖼️] เครื่องวัดความดันโลหิต    [▲][▼] [✏️] |  |  |  | VERDANT MEDICAL                      |  |  |
|  | [🖼️] หูฟังแพทย์               [▲][▼] [✏️] |  |  |  | Precision in care.                   |  |  |
|  |                                             |  |  |  |                                      |  |  |
|  |                                             |  |  |  |  [Product Card 1]                    |  |  |
|  |                                             |  |  |  |  [Product Card 2]                    |  |  |
|  |                                             |  |  |  +-----------------------------------+  |  |
+---------------------------------------------------+-----------------------------------------------+
```

### Mobile Wireframe (390×844 Viewport)
```
+------------------------------------+
| [🟢 VERDANT]         [🖨️ ส่งออก PDF] |
+------------------------------------+
|  SEGMENTED TAB (Sticky)            |
|  [  ✏️ แก้ไขข้อมูล  |  👁️ ดูตัวอย่าง  ] |
+------------------------------------+
|  CONTENT AREA                      |
|  (แสดงแผงควบคุม หรือ หน้ากระดาษ A4   |
|   ตาม Segment ที่เลือก)               |
|                                    |
|  + เพิ่มสินค้าใหม่ (Primary Button)  |
+------------------------------------+
```

---

## 4. Design Tokens (ที่ใช้งานได้จริง)

```css
:root {
  /* Brand Medical Palette */
  --color-primary: #123f35;       /* เขียวเข้มป่าไม้ (Forest) - WCAG AAA */
  --color-primary-hover: #1b5447;
  --color-accent: #164e40;
  --color-contrast: #947024;      /* ทองตัดเขียว */
  
  /* Neutral & Surfaces */
  --color-bg-app: #f4f7f4;        /* พื้นหลังแอป สะอาด ไม่ล้าสายตา */
  --color-surface: #ffffff;       /* พื้นหลังการ์ด/แผงควบคุม */
  --color-surface-subtle: #ebf1ed;
  --color-text-main: #1a2e26;     /* ข้อความหลัก Contrast > 7:1 */
  --color-text-muted: #52665a;    /* ข้อความรอง Contrast > 4.5:1 */
  --color-border: #d0ded5;        /* เส้นขอบ ชัดเจน */
  
  /* Feedback States */
  --color-success: #1e7e4e;
  --color-error: #c0392b;
  --color-warning: #d35400;

  /* Typography - Sarabun (มีหัว อ่านง่าย) */
  --font-family: 'Sarabun', -apple-system, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;           /* Base Input Size - กัน iOS Zoom Auto */
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  
  /* Touch & Spacing */
  --touch-target-min: 44px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  /* Elevation Shadows */
  --shadow-sm: 0 2px 8px rgba(18, 63, 53, 0.05);
  --shadow-md: 0 4px 16px rgba(18, 63, 53, 0.08);
  --shadow-lg: 0 12px 32px rgba(18, 63, 53, 0.12);
}
```

---

## 5. Components, States & Interactive Behaviors

| Component | State | Selector / Trigger | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Save Indicator** | `saving` / `saved` / `error` | `#status` / `save()` | แสดงสถานะมุมขวาบนของ Editor ด้วย Dot Indicator (เขียว = บันทึกแล้ว, ส้ม = กำลังบันทึก, แดง = Storage เต็ม) |
| **Tab Switcher** | `active` | `.control-tab-btn` | สลับซ่อน/แสดงกลุ่มควบคุม `#panel-products`, `#panel-style`, `#panel-brand` โดยไม่ต้อง Scroll |
| **Mobile View Switcher**| `edit` / `preview` | `#mobile-view-toggle` | บนจอ < 768px สลับระหว่างแผงแก้ไขกับหน้า Preview กระดาษ A4 ด้วย 1 Tap |
| **Reorder Buttons** | `disabled` | `.reorder-btn` | ตัวแรกปิด `up`, ตัวสุดท้ายปิด `down` ขนาดปุ่มเพิ่มเป็น 44×44px สำหรับสัมผัส |
| **Image Upload** | `drag-hover` / `error` | `#photo` / `#photo-error` | ลากวางไฟล์รูปภาพได้, แสดง inline error message ใต้ปุ่มอัปโหลดเมื่อไฟล์เกิน 15MB แทน `alert()` |
| **Product Modal** | `open` / `close` | `#editor` / `showModal()` | เปิดแก้ไขข้อมูลโดยมี Backdrop เบลอ, กด `Esc` หรือคลิกภายนอกเพื่อปิดได้ |

---

## 6. แผนแก้ไขโค้ด (Implementation Code Snippets)

### 6.1 `index.html` — ย่อส่วน Hero, เพิ่ม Tab System และ Mobile Switcher

```html
<!-- แทนที่ส่วน <header> และ <section class="intro"> เดิม -->
<header class="app-header">
  <a class="brand" href="#" aria-label="Verdant Catalog Studio">
    <span class="brand-mark" aria-hidden="true"><i></i></span>
    <span class="brand-word">VERDANT<small>MEDICAL CATALOG STUDIO</small></span>
  </a>
  
  <!-- แสดงสถานะบันทึกชัดเจนใกล้มือ -->
  <div class="save-status-badge" id="status" role="status">
    <span class="status-dot"></span> <span class="status-text">พร้อมใช้งาน</span>
  </div>

  <button id="print" class="primary">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/></svg>
    <span>ส่งออก PDF <b>· A4</b></span>
  </button>
</header>

<!-- Mobile View Switcher (แสดงเฉพาะจอเล็ก) -->
<div class="mobile-view-switcher" id="mobileSwitcher">
  <button type="button" class="active" data-view="edit">✏️ จัดการข้อมูล</button>
  <button type="button" data-view="preview">👁️ ดูตัวอย่าง A4</button>
</div>

<main class="studio-main">
  <div class="workspace">
    <aside aria-label="เครื่องมือออกแบบแคตตาล็อก">
      <!-- Navigation Tabs จัดกลุ่มการทำงาน -->
      <nav class="studio-tabs" aria-label="การจัดกลุ่มเครื่องมือ">
        <button type="button" class="tab-btn active" data-tab="products">📦 สินค้า (<b id="count">0</b>)</button>
        <button type="button" class="tab-btn" data-tab="style">🎨 สไตล์และแม่แบบ</button>
        <button type="button" class="tab-btn" data-tab="brand">🏢 ข้อมูลแบรนด์</button>
      </nav>

      <!-- Panel 1: รายการสินค้า (Main Task) -->
      <section id="panel-products" class="tab-panel active">
        <div class="panel-header">
          <p class="field-help">เพิ่มและจัดเรียงสินค้าที่จะแสดงในแคตตาล็อก</p>
          <button id="add" class="add-btn-primary"><span>＋</span> เพิ่มสินค้าใหม่</button>
        </div>
        <div id="productList" class="product-list-container"></div>
      </section>

      <!-- Panel 2: สไตล์และแม่แบบ -->
      <section id="panel-style" class="tab-panel" hidden>
        <!-- เนื้อหาแม่แบบ ชุดสี ฟอนต์ คงเดิมจากโค้ดเดิม -->
      </section>

      <!-- Panel 3: ข้อมูลแบรนด์ -->
      <section id="panel-brand" class="tab-panel" hidden>
        <!-- เนื้อหาข้อมูล

แบรนด์ ชื่อแคตตาล็อก ช่องทางติดต่อ คงเดิมจากโค้ดเดิม -->
      </section>
    </aside>

    <section class="preview-area" id="previewArea" aria-label="ตัวอย่างแคตตาล็อก">
      <div class="preview-toolbar">
        <span><i class="status-dot"></i> ตัวอย่างแคตตาล็อก A4</span>
        <span class="paper-badge">210 × 297 มม. (สเกลจริง)</span>
      </div>
      <div class="paper-stage">
        <article id="catalog"></article>
      </div>
    </section>
  </div>
</main>
```

---

### 6.2 `style.css` — Touch Targets, Contrast และ Responsive Mobile View

```css
/* Typography & Accessibility Base Improvements */
body {
  font-family: 'Sarabun', Arial, sans-serif;
  font-size: var(--font-size-md);
  color: var(--color-text-main);
  background: var(--color-bg-app);
}

/* บังคับขนาด Input ป้องกัน iOS ซูม */
input:not([type=color]), textarea, select {
  font-size: 16px !important;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

/* Studio Tabs */
.studio-tabs {
  display: flex;
  background: var(--color-surface-subtle);
  border-bottom: 1px solid var(--color-border);
  padding: 6px 6px 0;
  gap: 4px;
}
.tab-btn {
  flex: 1;
  min-height: 44px;
  border: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}
.tab-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

/* Product Item Touch Target & Reorder Buttons (44x44px) */
.product-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.reorder-controls button {
  width: 44px;
  height: 44px;
  min-width: 44px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
}

/* Mobile Switcher & Responsive Viewports */
.mobile-view-switcher { display: none; }

@media (max-width: 768px) {
  .app-header { min-height: 60px; padding: 10px 16px; }
  .mobile-view-switcher {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 6px 16px;
    gap: 8px;
  }
  .mobile-view-switcher button {
    flex: 1;
    min-height: 44px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-app);
    font-weight: 600;
  }
  .mobile-view-switcher button.active {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }

  /* Mobile Toggle Logic */
  .workspace[data-mobile-view="edit"] .preview-area { display: none; }
  .workspace[data-mobile-view="preview"] aside { display: none; }
  .workspace[data-mobile-view="preview"] .preview-area { display: block; width: 100%; }
}
```

---

### 6.3 `main.js` — Tab Logic, Inline Error & Backward Compatibility

```javascript
// คงคีย์ localStorage และ schema เดิมไว้ 100%
const STORAGE_KEY = 'verdant-catalog';

// Tab Switcher Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
    
    btn.classList.add('active');
    const activePanel = document.getElementById(`panel-${btn.dataset.tab}`);
    if (activePanel) activePanel.hidden = false;
  });
});

// Mobile View Switcher Logic
const workspace = document.querySelector('.workspace');
document.querySelectorAll('#mobileSwitcher button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#mobileSwitcher button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    workspace.dataset.mobileView = btn.dataset.view;
  });
});

// Save State Indicator Handler (แทนที่การอัปเดตข้อความธรรมดา)
function save() {
  const statusText = $('#status .status-text');
  const statusDot = $('#status .status-dot');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (statusText) statusText.textContent = 'บันทึกเรียบร้อย';
    if (statusDot) statusDot.style.background = 'var(--color-success)';
    return true;
  } catch (err) {
    if (statusText) statusText.textContent = 'หน่วยความจำเต็ม!';
    if (statusDot) statusDot.style.background = 'var(--color-error)';
    return false;
  }
}

// Inline File Upload Error Handling (แทนการใช้ alert)
$('#photo').onchange = async (e) => {
  const file = e.target.files[0];
  const errorMsg = $('#photoError') || createErrorContainer();
  errorMsg.textContent = '';
  
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
    errorMsg.textContent = 'กรุณาเลือกไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 15 MB';
    return;
  }
  // Logic อ่านไฟล์ Canvas ดั้งเดิมคงไว้ครบถ้วน...
};

function createErrorContainer() {
  const el = document.createElement('small');
  el.id = 'photoError';
  el.style.color = 'var(--color-error)';
  el.style.display = 'block';
  el.style.marginTop = '6px';
  $('#photo').parentNode.appendChild(el);
  return el;
}
```

---

## 7. ความเสี่ยงและ Acceptance Checklist

### ความเสี่ยงในการนำไปใช้จริง (Implementation Risks)
1. **Base64 Storage Quota Overrun:** หากผู้ใช้เพิ่มรูปขนาดใหญ่หลายรูป อาจชนโควตา 5MB ของ `localStorage` สื่อสารผ่าน Inline Error และปรับการบีบอัดภาพ Canvas ให้กว้างไม่เกิน 1000px
2. **A4 Page-Break Overflow:** ในกรณีผู้ใช้ใส่รายละเอียดสินค้ายาวเกินไป ตัวหนังสืออาจหลุดขอบกระดาษ A4 ในการพิมพ์จริง ต้องตั้งค่า CSS `break-inside: avoid;` สำหรับ `.product-card`
3. **Legacy Data Migration:** ผู้ใช้ที่มีข้อมูลเดิมใน `localStorage` นำไปเปิดใน UI ใหม่ ต้องไม่สูญหายข้อมูล โดยระบบจะใช้คีย์ `verdant-catalog` และฟังก์ชัน `render()` เดิม

### Acceptance Checklist
- [ ] บนจอ Desktop (1440×900) เห็นพื้นที่แก้ไขสินค้า และ Preview A4 พร้อมกันโดยไม่ต้อง Scroll
- [ ] บนจอ Mobile สามารถสลับระหว่างโหมด "แก้ไข" และ "ดูตัวอย่าง" ได้ใน 1 Tap ผ่าน Switcher
- [ ] ปุ่มกดและ Touch Targets มีขนาดไม่ต่ำกว่า 44×44px บนอุปกรณ์มือถือ
- [ ] ข้อความบนหน้าจอผ่านเกณฑ์ Contrast Ratio 4.5:1 (ฟอนต์ Sarabun อ่านง่าย มีหัว)
- [ ] ข้อมูลเดิมใน `verdant-catalog` ถูกโหลดขึ้นมาแสดงผลได้ถูกต้อง และส่งออก PDF A4 ไม่โดนตัดขอบ
