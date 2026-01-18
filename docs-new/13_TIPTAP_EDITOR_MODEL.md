# Tiptap Editor Model (Notion-like Body)

الـ Record Body في كل كيان (Task/Project/Meeting/Client/Strategy/Brand…) يعتمد على Tiptap.

## الهدف
- كتابة منظمة (Headings/Lists/Checklists)
- Blocks قابلة لإعادة الترتيب
- Embeds لعناصر النظام (Task table داخل Project مثلًا)
- Attachments (Uploads/Drive links)

## Document Storage
- كل Record له:
  - body_doc: JSON (Tiptap/ProseMirror schema)
  - body_text: نص مبسط للبحث (اختياري)
  - attachments: قائمة روابط/ملفات (اختياري)

## Blocks (MVP)
- Paragraph
- Heading (H1-H3)
- Bullet list / Ordered list
- Task list (Checkbox list)
- Quote
- Code block (اختياري)
- Divider

## Mentions & Links
- User mention: @name
- Record mention: #Task / #Project / #Client (يتحول لرابط مع preview)

## Embeds (MVP)
Embeds تعتبر Nodes خاصة في الـ schema:
- Database View Embed:
  - entity: tasks/projects/meetings…
  - viewId (saved view) أو inline filters
  - display: table/board/list
- KPI Card Embed (later)
- Ads Campaign Embed (later)

## Attachments
- File attachment node (اسم + حجم + نوع + رابط)
- Drive link node (اسم + icon + رابط + صلاحيات)

## UX داخل الـ Record
- Slash menu:
  - /h1 /h2 /todo /table-view /divider /quote /attachment
- Drag handle للـ blocks (desktop) + long-press (mobile)
- Paste handling:
  - لصق روابط Drive يتحول لDrive node
  - لصق نص طويل يحافظ على headings والقوائم

## Performance Rules
- Lazy-load editor:
  - لا يتحمل في list rows
  - يتحمل فقط عند فتح record
- Large docs:
  - pagination للـ comments، مش للـ editor
  - تجنب embeds الثقيلة داخل نفس الصفحة إلا عند التوسيع

