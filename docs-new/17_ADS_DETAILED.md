# Ads (تفصيلي) — Client-scoped + Workspace Overview

الهدف من Ads:
- عرض موحّد لحسابات الإعلانات والحملات ومؤشرات الأداء
- فلترة حسب Client/Platform/Date range/Status
- Live mode للمراقبة + Alerts
- (لاحقًا) Controls role-based (pause/resume/budget)

---

## 1) Ads Entry Points

### من الـ Workspace
- Ads Overview: نظرة شاملة لكل العملاء
- Filters ثابتة:
  - Client picker
  - Platform picker
  - Date range

### من Client Record
- Client → Ads tab
- زر “Open in Ads” يفتح Ads page مع filter client=this

---

## 2) Ads Pages (MVP)

### 2.1 Ads Overview

#### Desktop
- Header: Ads + Live toggle + Date range
- KPI row:
  - Spend
  - Impressions
  - Clicks
  - Conversions
  - ROAS (لو متاح)
- Table: campaigns summary (virtualized)
- Alerts panel (اختياري):
  - spend spike
  - roas drop

#### Mobile
- Client picker أعلى
- KPI cards stacked
- Campaigns list + sort/filter

### 2.2 Accounts
- قائمة Accounts per client/platform
- Status:
  - Connected
  - Token expired
  - Permission missing
- Actions:
  - Connect/Reconnect (role-based)
  - Disconnect (high risk)

### 2.3 Campaigns
- Views:
  - Table (default)
  - Board (optional: group by status/objective)
- Columns:
  - Campaign name
  - Status
  - Objective
  - Spend
  - Results
  - CPA / ROAS (حسب المتاح)
- Drilldown:
  - Campaign → ad sets/ad groups → ads → creatives (progressive disclosure)

#### Campaign Drilldown — Desktop
- click row:
  - يفتح Campaign Sheet يمين (افتراضي)
  - Open as page
- Tabs داخل الـ Sheet:
  - Summary (KPIs + trend mini charts)
  - Ad Sets / Ad Groups (table)
  - Ads (table)
  - Creatives (gallery)
  - Notes (Tiptap) + Comments/Activity

#### Campaign Drilldown — Mobile
- open full page (افتراضيًا)
- tabs كـ segmented control أو top tabs

#### Quick Actions (Role-based)
- View-only (MVP): كل المستخدمين المصرّح لهم يشوفوا البيانات
- Later (Controls):
  - Pause/Resume
  - Budget update
  - Require confirmation + audit entry

### 2.4 Creatives (اختياري MVP)
- Gallery view:
  - preview
  - type (image/video)
  - campaign links
  - approvals (later)

---

## 3) Filters & Saved Views (Ads)

### Filters الأساسية
- Client
- Platform
- Date range
- Status (active/paused)
- Objective
- Spend > / < threshold

### Saved Views أمثلة
- “Client A - Weekly”
- “Meta - Last 7 days”
- “High Spend Campaigns”

---

## 4) Live Mode (MVP-light)

### الهدف
مراقبة سريعة بدون ما نضغط على API.

### UX
- Live toggle:
  - On: refresh on demand أو polling خفيف (حسب السياسة)
  - Off: يعتمد على cached daily metrics
- Show last refreshed timestamp
- Rate limit message لو المستخدم ضغط كتير

---

## 5) Ads Controls (Later)
- Role-based:
  - Pause/Resume campaign
  - Update budget
- Always require confirmation
- (Optional) Approval workflow للـ high-risk changes

---

## 6) Alerts (MVP)
- Rule templates:
  - Spend spike vs yesterday
  - ROAS dropped below X for 48h
  - No conversions for N days
- Delivery:
  - Inbox notification
  - Mention assigned analyst
  - (Later) Email
