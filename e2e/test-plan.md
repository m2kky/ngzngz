# Playwright E2E Test Plan

## 1. Authentication
**File**: `app/(auth)/login/page.tsx`
**Goal**: Verify user can log in and access protected routes.
- **Scenario 1: Successful Login**
    - Navigate to `/login`.
    - Enter valid credentials (mocked).
    - Click "Login".
    - Expect URL to change to `/dashboard`.
    - Expect "Welcome back" toast or text.
- **Scenario 2: Failed Login**
    - Enter invalid credentials.
    - Click "Login".
    - Expect error toast/message.

## 2. Sensei Chat Interface
**File**: `components/sensei/sensei-widget.tsx`
**Goal**: Verify AI chat interaction.
- **Pre-requisite**: User is logged in (or session mocked).
- **Scenario 1: Open/Close Widget**
    - Click the Ghost icon button (`data-testid="sensei-trigger"`).
    - Verify chat window opens (`data-testid="sensei-window"`).
    - Click close/minimize.
    - Verify chat window closes.
- **Scenario 2: Send Message**
    - Open chat.
    - Type into input (`data-testid="sensei-input"`).
    - Click send (`data-testid="sensei-send"`).
    - Verify message appears in chat list (`data-testid="chat-message-user"`).
    - Verify input is cleared.
- **Scenario 3: Receive Response**
    - Mock API response for `/api/chat`.
    - Send message.
    - Expect "assistant" message to appear.

## 3. UI Responsiveness
**Goal**: Verify layout on different viewports.
- **Scenario 1: Mobile Layout**
    - Set viewport to mobile size.
    - Verify Sensei widget is still accessible (maybe different position/behavior?).
    - Check navigation menu collapses/adapts.

## 4. Tool Execution (Mocked)
- **Goal**: Verify Supabase actions initiated by Chat.
- **Scenario**:
    - Mock `/api/chat` to return a tool call response (if applicable) or verify that the frontend handles structured data if the AI returns it. (Assuming Sensei just chats for now, but plan mentions "Tool Execution". We will stick to verifying the Chat UI feedback for now as the tool execution logic might be server-side or complex to mock fully without more info).

## Implementation Strategy
- **Base URL**: `http://localhost:3000`
- **Mocking**: Use `page.route` to mock `/api/chat` and Supabase calls.
- **Selectors**: Use `data-testid` where possible.
