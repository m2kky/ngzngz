# Chat + AI Chat & Agent

## 1) Chat (Workspace Chat)

### الهدف
- قناة تواصل تشغيلية داخل الـ Workspace بدل التشتت بين أدوات
- ربط المحادثات مباشرة بعناصر النظام (Task/Project/Client/Meeting/Ads)

### المكونات
- Channels (عام/فِرق/حسب العميل) + Direct Messages (اختياري في MVP)
- Message composer:
  - Mentions: @person, #channel, وربط Records (Task/Client…)
  - Attachments: ملفات + روابط Drive
- Message actions:
  - Reply thread
  - Pin/Save
  - Create task from message
  - Link message to record

### Inbox Integration
- Mentions والتنبيهات تطلع في Inbox
- Go to source يفتح الرسالة أو الـ record المرتبط

## 2) AI Chat

### الهدف
مساعد ذكي للكتابة والتلخيص والبحث داخل مساحة العمل.

### استخدامات
- تلخيص اجتماع وتحويله لـ Action items
- صياغة brief / رسالة للعميل
- اقتراح تقسيم مهمة كبيرة إلى subtasks
- تلخيص أداء أسبوعي من Tasks/Meetings/Ads (later)

### قواعد
- Read-only افتراضيًا
- لا يعرض بيانات خارج صلاحية المستخدم

## 3) AI Agent (Agent Mode)

### الفكرة
الـ Agent بيقوم بأفعال داخل النظام كأنه مستخدم، لكن دايمًا:
- ضمن صلاحيات الدور (Role-based)
- مع سجل تدقيق (Audit log)
- مع موافقات (Approvals) للأوامر الحساسة

### شكل الأوامر (User Experience)
- المستخدم يكتب: اعمل view اسمه My Tasks أو ابعت reminder للي عندهم overdue
- الـ Agent يرد بخطة تنفيذ + Preview
- المستخدم يوافق (Approve) أو يرفض
- التنفيذ + نتيجة + روابط للـ changes

### تصنيف المخاطر (Risk Levels)
- Low: create task, update title/description, add comment
- Medium: reassign tasks, bulk updates, create automation
- High: delete records, change roles, integrations tokens, Ads budget/pause
- Critical: workspace security settings, exporting sensitive data

### Approvals
- إعدادات:
  - Always ask قبل أي Write
  - Ask only for Medium+ أو High+
  - Ask based on role (Guest دائمًا ممنوع)
- Two-person rule لاحقًا للـ High/Critical

### Agent History
- قائمة Runs:
  - الطلب
  - المستخدم
  - الصلاحية المستخدمة
  - التغييرات اللي حصلت
  - الحالة (نجاح/فشل)
  - سبب الفشل لو حصل

## 4) RBAC للـ Chat والـ AI
- Chat:
  - view/send حسب الدور
  - delete/edit message عادة Admin/Owner أو صاحب الرسالة ضمن سياسة
- AI:
  - chat allowed لأدوار معينة
  - agent execute ممنوع للـ Guest
  - admin actions محظورة إلا للـ Admin/Owner

