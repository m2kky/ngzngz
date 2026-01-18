# Views, Filters, Saved Views

## مفهوم Database View
كل صفحة Database (Tasks/Projects/Clients/Meetings/Ads…) فيها View Tabs.
كل View = (Layout + Filters + Sorts + Grouping + Columns) ومحفوظ باسم.

## أنواع الـ Views (MVP)
- Table
- Board (Kanban)
- List
- Calendar
- Timeline (اختياري مبكرًا)
- Gallery (للـ Clients/Assets)

## عناصر التحكم داخل أي View
- View selector (Tabs/Dropdown)
- Search
- Filters (AND/OR + Groups)
- Sorts (multi-sort)
- Group by (مهم للـ Board/List)
- Columns (Table)
- Saved views:
  - Private (للمستخدم)
  - Shared (للـ Workspace)
  - Default (افتراضي للكيان)

## Filter Rules (أمثلة)
- Assignee is me
- Client is "Client A"
- Status is not Done
- Due date is within next 7 days
- Priority in (High, Urgent)
- Content Type is Video
- Tags contains "Ramadan"

## Operators حسب نوع الـ Property
- Text: contains / not contains / is empty
- Number: = / > / < / between
- Select/Status: is / is not / in
- Multi-select: contains any / contains all
- Person: is / is not / includes
- Date: before / after / between / next N days / past N days
- Checkbox: checked / unchecked
- Relation: contains / does not contain

## Views جاهزة مقترحة لصفحة Tasks
- All Tasks (Default)
- My Tasks
- Overdue
- This Week
- By Client (Board grouped by Client)
- Unassigned

