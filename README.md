# ระบบจดหวยไทย

ระบบบันทึกและจัดการข้อมูลการซื้อหวยไทยแบบออนไลน์ รองรับทั้งหวยบน ล่าง ลอย และโหมดหมุนเลข

## คุณสมบัติหลัก

- 📝 **บันทึกรายการซื้อหวย** — รองรับเลข 1-3 หลัก, ประเภทบน/ล่าง/ลอยบน/ลอยล่าง
- 🔄 **โหมดหมุนเลข** — หมุนหน้า/หมุนท้าย สำหรับเลข 3 หลักประเภทล่าง
- 🚫 **เลขอั้น** — จัดการเลขที่ไม่รับแทงในแต่ละงวด (แยกตามงวด)
- 📊 **Dashboard** — ยอดขายรวม, จำนวนลูกค้า, เลขยอดนิยม
- 🔍 **ค้นหา** — ค้นหาตามชื่อลูกค้าหรือเลข
- 📱 **Responsive** — ใช้งานได้ทั้งคอมพิวเตอร์, iPad, และมือถือ
- 📅 **งวดอัตโนมัติ** — คำนวณงวดตามวันที่ (1 และ 16 ของเดือน)
- ✏️ **แก้ไข/ลบ** — แก้ไขและลบรายการได้ทีละรายการหรือทั้งหมด
- ⚡ **Real-time** — ข้อมูลอัปเดตแบบ real-time ผ่าน Supabase

## เทคโนโลยี

- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React

## การติดตั้ง

### 1. Clone Repository

```bash
git clone <repository-url>
cd under-lottery
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Supabase

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. สร้าง Database Schema

เข้าไปที่ Supabase SQL Editor แล้วรันไฟล์ตามลำดับ:

1. `complete-setup.sql` — สร้างตาราง, indexes
2. `mock_data_3_draws.sql` — (Optional) ข้อมูลทดสอบ 3 งวด

### 5. ปิด Row Level Security (RLS)

ใน Supabase SQL Editor รันคำสั่ง:

```sql
ALTER TABLE draws DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE forbidden_numbers DISABLE ROW LEVEL SECURITY;
```

หรือตั้งค่า RLS Policies ตามความต้องการ

### 6. รันโปรเจกต์

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

## โครงสร้างโปรเจกต์

```
under-lottery/
├── src/
│   ├── components/          # React Components
│   │   ├── AddEntryModal.jsx
│   │   ├── AmountInputs.jsx
│   │   ├── BetTypeSelector.jsx
│   │   ├── BuyerCard.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── EntryCard.jsx
│   │   ├── EntryForm.jsx
│   │   ├── EntryModal.jsx
│   │   ├── ReverseModeSelector.jsx
│   │   └── Toast.jsx
│   ├── hooks/               # Custom Hooks
│   │   └── useEntryEditor.js
│   ├── lib/                 # Utilities & Validation
│   │   ├── supabase.js
│   │   ├── utils.js
│   │   └── validators.js
│   ├── App.jsx              # Main Component
│   ├── index.css            # Global Styles
│   └── main.jsx
├── complete-setup.sql       # Database Schema
├── mock_data_3_draws.sql    # Mock Data (3 งวด)
└── README.md
```

## การใช้งาน

### บันทึกหวย

1. กดปุ่ม "**บันทึกหวย**"
2. กรอกชื่อลูกค้า (มี autocomplete)
3. กรอกเลข, เลือกประเภท (บน/ล่าง)
4. เลข 3 หลัก + ล่าง → แสดงตัวเลือกหมุนหน้า/หมุนท้าย
5. กรอกจำนวนเงิน (รองรับหลายช่อง เช่น 100x50x30)
6. กด "เพิ่มเลข" สำหรับเลขถัดไป
7. กด "บันทึก"

### แก้ไขรายการ

1. คลิกที่การ์ดลูกค้า
2. กดปุ่ม "**แก้ไข**"
3. แก้ไขข้อมูลตามต้องการ
4. คลิกปุ่มถังขยะเพื่อทำเครื่องหมายลบรายการ (ปุ่มจะเป็นสีแดง)
5. กด "**บันทึก**" → ลบและอัปเดตจริงในฐานข้อมูล
6. กด "**ยกเลิก**" → ไม่บันทึกการเปลี่ยนแปลง

### ลบลูกค้าทั้งหมด

1. คลิกที่การ์ดลูกค้า
2. กดปุ่ม "**ลบ**" ด้านบน
3. ยืนยันการลบ → ลบทั้งหมดในงวดนั้น

### เลขอั้น

1. กดปุ่ม "**เลขอั้น**" ใน header
2. กรอกเลข (1-3 หลัก)
3. กด "เพิ่ม"
4. ลบได้เฉพาะงวดปัจจุบัน (งวดอื่นจะมีไอคอน 🔒)

### ดูงวดอื่น

เลือกงวดจาก dropdown ใน header → ดูได้อย่างเดียว, แก้ไข/ลบ/เพิ่มได้เฉพาะงวดปัจจุบัน

## กฎการใช้งาน

- เลข 1 หลัก → ลอยบน/ลอยล่าง (1 ช่องเงิน)
- เลข 2 หลัก → บน/ล่าง (ใส่เงินได้หลายช่อง)
- เลข 3 หลัก → บน/ล่าง + หมุนหน้า/หมุนท้าย (เฉพาะล่าง)
- เลขเดียวกัน (เช่น 11, 222) → 1 ช่องเงิน
- โหมดหมุน → 1 ช่องเงิน
- เลขอั้น → ไม่สามารถบันทึกได้
- ไม่สามารถเพิ่มเลข + ประเภทที่ซ้ำกัน (เช่น 123 บน ซ้ำกับ 123 บน)

## Database Schema

### draws (งวดหวย)
- `id` (UUID, PK)
- `draw_date` (TEXT, UNIQUE) — "1/8/2026"
- `actual_date` (DATE) — 2026-08-01
- `created_at` (TIMESTAMPTZ)

### buyers (ลูกค้า)
- `id` (UUID, PK)
- `name` (TEXT, UNIQUE)
- `created_at` (TIMESTAMPTZ)

### entries (รายการแทง)
- `id` (UUID, PK)
- `buyer_id` (UUID, FK → buyers)
- `draw_id` (UUID, FK → draws)
- `number` (TEXT) — "123"
- `bet_type` (TEXT) — "บน", "ล่าง", "ลอยบน", "ลอยล่าง"
- `amount` (TEXT) — "100" or "50x80x100"
- `reverse_mode` (TEXT) — "หมุนหน้า", "หมุนท้าย", NULL
- `created_at` (TIMESTAMPTZ)

### forbidden_numbers (เลขอั้น)
- `id` (UUID, PK)
- `number` (TEXT)
- `draw_id` (UUID, FK → draws)
- `created_at` (TIMESTAMPTZ)
- UNIQUE(number, draw_id)

## Build & Deploy

```bash
npm run build
```

ไฟล์จะถูกสร้างใน `dist/` — deploy ไปที่ Vercel, Netlify, หรือ host ที่รองรับ static site

## License

MIT
