Let’s break this down step-by-step into a **Product Design Document (PDD)**:

---

# Product Design Document: Snooker Club Management Application

## Overview
The **Snooker Club Management Application** is a solution designed to manage snooker clubs efficiently. It facilitates table bookings, match tracking, payments (outstanding and collected), daily expenses, and more. The app supports **offline functionality** with syncing mechanisms upon re-establishing internet connectivity.

---

## Features and Functionalities

### 1. **Home Page**
- Displays **Table Cards** for 7 tables initially. 
- Supports adding additional tables dynamically.
- Each table card includes:
  - **Player 1 & Player 2 Names**
  - **Login Time** & **Logout Time**
  - **Log In** & **Log Out** buttons
  - **Format Dropdown** (Options: *Per Frame* or *Per Minute*)
    - *Per Frame*: Displays the **No. of Frames** field (₹400 per frame).
    - *Per Minute*: Calculates time-based charges (₹10 per minute).
  - **Apply Discount** (Checkbox):
    - Displays **Discount Field (Percentage)**.
    - Adjusts **Final Price** after applying the discount.
  - **Due Fees** (Radio buttons for loser: *Player 1* or *Player 2*).
  - **Payment Method Dropdown** (Cash, Online, Credit).
  - **New Entry Button**: Submits all data to the backend.

---

### 2. **Dashboard**
#### Subsections:
1. **Ongoing Matches**
   - Displays active matches for all tables.
   - Includes:
     - Logout Button
     - Update Button
     - Match details (Player names, Login/Logout, Time, Charges).

2. **Outstanding Payments**
   - Displays tables with pending dues.
   - Allows updating the dues status (*Pending* or *Paid*).

3. **Completed Matches**
   - Displays all completed matches with:
     - Players involved
     - Match duration
     - Charges (Initial Price, Discounted Price).
     - Discount applied status.

---

### 3. **Daily Expenses**
- Form to add daily club expenses:
  - **Description** (Text Field)
  - **Tag** (Dropdown: Food, Maintenance, Utilities, Salary Advance, Other)
  - **Quantity**
  - **Rate**
  - **Amount** (Auto-calculated)
- List of recorded expenses displayed in a table.

---

### 4. **Settings**
- Allows user profile management:
  - **Name**
  - **Email**
  - **Phone Number**
  - **Description**
- Expandable sidebar footer section.

---

### 5. **Offline Functionality**
- Implements caching to store data locally if the internet is unavailable.
- Syncs data to the backend automatically when the connection is restored.
- Displays up-to-date frontend UI with backend synchronization.

---

### 6. **External Device Control (Future Scope)**
- A method to control table lights via Raspberry Pi (or similar).
- Updates light status on a local server.

---

## Technical Architecture

### **Frontend**
- **Framework/Tools**:
  - **React.js** with **CDN component libraries** for rapid UI development.
  - **Service Workers** for offline caching.
- **UI Components**:
  - Table cards, forms, and dynamic dashboards.
  - Responsive design with desktop/tablet/mobile views.
- **State Management**:
  - **Redux Toolkit** or Context API for handling dynamic states.

### **Backend**
- **Supabase**:
  - Database tables for:
    - **Matches**:
      - Fields: `id`, `table_no`, `player1`, `player2`, `login`, `logout`, `format`, `no_frames`, `time`, `initial_price`, `discount`, `final_price`, `loser`, `method`, `status`.
    - **Expenses**:
      - Fields: `id`, `description`, `tag`, `quantity`, `rate`, `amount`, `date`.
    - **Users**:
      - Fields: `id`, `name`, `email`, `phone`, `description`.
  - **Authentication**: User login via Supabase Auth.
  - Offline sync enabled via Supabase `row-level security` policies.

---

### **Offline Mode Implementation**
1. **Caching Logic**:
   - LocalStorage/IndexedDB for storing user actions and match records temporarily.
   - Service Workers to intercept requests and store them offline.

2. **Sync Mechanism**:
   - A background sync service that:
     - Monitors network status.
     - Pushes offline data to Supabase once online.
   - Updates frontend with the latest backend data upon sync.

---

### **Third-party Tools**
1. **UI Libraries**: TailwindCSS or Material UI.
2. **Supabase** for database and authentication.
3. **PWA (Progressive Web App)** for offline-first approach.
4. **WebSockets** for real-time updates.

---

## Core User Flows

### 1. Match Management
1. User logs in to the app.
2. Navigates to the Home Page → Selects a table.
3. Enters player names → Logs the match.
4. Updates match duration and charges upon completion.
5. Adds payments and discounts → Completes the match.

### 2. Expense Tracking
1. Navigates to **Daily Expenses**.
2. Enters an expense → Selects category.
3. Amount auto-calculates → Submits data.
4. Views the list of past expenses in a tabular format.

### 3. Payment Management
1. Checks **Outstanding Payments** in Dashboard.
2. Marks payments as *Paid* → Updates dues status.

---

## Development Phases
### **Phase 1**: MVP (1 Month)
- Implement:
  - Home Page
  - Dashboard with **Ongoing Matches**.
  - Basic CRUD for Matches and Payments.
- Setup Supabase backend.

### **Phase 2**: Advanced Features (2-3 Months)
- Add:
  - Offline-first mode.
  - Daily Expenses tracking.
  - User Settings.
  - Completed Matches view.

### **Phase 3**: External Controls (Future Scope)
- Raspberry Pi integration for table lights.

---

## Visual Screens

### 1. **Sidebar Navigation**
- Collapsible menu for mobile devices.

### 2. **Home Page**
- Dynamic table cards with add/remove functionality.

### 3. **Dashboard**
- **Tabs** for ongoing matches, outstanding payments, and completed matches.

### 4. **Daily Expenses**
- Expense form and history table.

### 5. **Settings**
- User profile settings form.

---

