# UI Foundation (شكل عام + أنماط)

## مبادئ الشكل
- Dark-first + Light option
- Glass/blur طبقة خفيفة (مش على كل شيء) لتقليل التكلفة على الموبايل
- كثافة معلومات عالية على الديسكتوب، وكثافة أقل على الموبايل
- كل شيء مبني حول “Database Views” و “Record Pages”

## Workspace Appearance (Theme + Background)
- Theme per workspace:
  - Light / Dark / System (اختياري)
  - override per user (اختياري: user يختار ثيمه داخل نفس الـ workspace)
- Background per workspace:
  - Color
  - Gradient (presets + custom)
  - Image (upload/select) + blur/overlay opacity
- UX قواعد:
  - الخلفية لا تؤثر على readability: overlay + contrast guard
  - نفس الخلفية تُستخدم على Desktop/Mobile لكن مع overlay أعلى على الموبايل
- Performance:
  - صور الخلفية: lazy + compress + حد أقصى للحجم
  - تجنب blur قوي على مساحات كبيرة في الموبايل

## Layout Shell

### Desktop
- Sidebar (قابلة للطي) + Top Header
- Content container بعرض مناسب + scroll داخل المحتوى
- Record: يفتح Sheet جانبي افتراضيًا + Open as page

### Mobile
- Sticky Mobile Header (عنوان + أزرار أساسية)
- Bottom Bar (5 tabs) + More bottom sheet
- FAB لإنشاء سريع
- Record: Full Page افتراضيًا، Quick edit bottom sheet للخصائص السريعة

## Toolbar Pattern (لكل Database View)
- View selector
- Search
- Filter
- Sort
- Group
- Columns (Table فقط)
- Saved views (Dropdown)

### Mobile Toolbar
- أزرار أيقونات + Filter sheet
- Filters تظهر كـ chips تحت العنوان

## Record Page Pattern (مشترك)
- Header: icon + title + breadcrumbs + actions
- Properties Row: system + custom + add property
- Body: Tiptap editor + sections/blocks + embeds
- Comments + Activity: تبويب أو section سفلي

## Animations (مبادئ)
- Page transitions: fade + slight slide
- Navigation active state: bubble/glow خفيف
- Sheets: spring صغير ومدة قصيرة
- Lists: تجنب animations لكل item؛ استخدم skeleton + subtle transitions فقط

## Empty / Loading / Error States
- Empty: CTA واضح + template quick start
- Loading: skeletons بدل spinners الطويلة
- Error: رسالة قصيرة + retry + diagnostics link (لو admin)
