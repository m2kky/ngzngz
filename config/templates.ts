export const TASK_TEMPLATES = [
    {
        id: "social-post",
        name: "Social Media Post",
        icon: "📱",
        title: "[Platform] Topic - Date",
        content: {
            type: "doc",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Hook 🪝" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "Write a catchy hook here..." }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Body 📝" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "Main content goes here..." }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Call to Action 📣" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "What should they do next?" }],
                },
                {
                    type: "heading",
                    attrs: { level: 3 },
                    content: [{ type: "text", text: "Hashtags #" }],
                },
                {
                    type: "bulletList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "#marketing" }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "#genz" }] }] },
                    ],
                },
            ],
        },
    },
    {
        id: "bug-report",
        name: "Bug Report",
        icon: "🐛",
        title: "Bug: [Short Description]",
        content: {
            type: "doc",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Description" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "What happened?" }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Steps to Reproduce" }],
                },
                {
                    type: "orderedList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Step 1" }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Step 2" }] }] },
                    ],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Expected Behavior" }],
                },
                {
                    type: "paragraph",
                },
            ],
        },
    },
    {
        id: "ugc-brief",
        name: "UGC Brief",
        icon: "🎥",
        title: "UGC Brief: [Product Name] - [Angle]",
        content: {
            type: "doc",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Concept & Angle 💡" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "Describe the core concept (e.g., 'Unboxing', 'Problem/Solution')." }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Visual Requests 📸" }],
                },
                {
                    type: "bulletList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Show product in natural light" }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Close-up of texture" }] }] },
                    ],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Script / Speaking Points 🗣️" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "- Mention key benefit: X" }],
                },
            ],
        },
    },
    {
        id: "ad-campaign",
        name: "Ad Campaign Setup",
        icon: "🚀",
        title: "Campaign: [Objective] - [Date]",
        content: {
            type: "doc",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Campaign Objective 🎯" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "Traffic / Conversions / Awareness" }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Target Audience 👥" }],
                },
                {
                    type: "bulletList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Location: " }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Interests: " }] }] },
                    ],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Creatives Needed 🎨" }],
                },
                {
                    type: "taskList",
                    content: [
                        { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Static Image 1" }] }] },
                        { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Video Ad 1" }] }] },
                    ],
                },
            ],
        },
    },
    {
        id: "seo-blog",
        name: "SEO Blog Post",
        icon: "✍️",
        title: "Blog: [Keyword] - [Working Title]",
        content: {
            type: "doc",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Target Keywords 🔑" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "Primary: ..." }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Outline 📝" }],
                },
                {
                    type: "heading",
                    attrs: { level: 3 },
                    content: [{ type: "text", text: "Introduction" }],
                },
                {
                    type: "heading",
                    attrs: { level: 3 },
                    content: [{ type: "text", text: "H2: Main Point 1" }],
                },
                {
                    type: "heading",
                    attrs: { level: 3 },
                    content: [{ type: "text", text: "H2: Main Point 2" }],
                },
                {
                    type: "heading",
                    attrs: { level: 3 },
                    content: [{ type: "text", text: "Conclusion" }],
                },
            ],
        },
    },
    {
        id: "email-newsletter",
        name: "Email Newsletter",
        icon: "📧",
        title: "Email: [Subject Line Idea]",
        content: {
            type: "doc",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Subject Line Options 📬" }],
                },
                {
                    type: "bulletList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Option A: " }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Option B: " }] }] },
                    ],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Preheader Text" }],
                },
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "Preview text here..." }],
                },
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Body Content 📄" }],
                },
            ],
        },
    },
]
