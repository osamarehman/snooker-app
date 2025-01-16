Below is a *detailed* Product/Project Design Document (PDD) for your Snooker Club Management Application. It integrates all the screens and functionalities you’ve described: table management, match bookings, payments, outstanding dues, completed matches, daily expenses, user settings, and offline-first capabilities using Supabase as the backend. 

---

## 1. **Introduction**

### 1.1 Purpose

The Snooker Club Management App aims to help snooker club owners efficiently manage:
- Table bookings
- Ongoing matches
- Time- or frame-based billing
- Discounts & payments
- Outstanding dues
- Completed matches (record-keeping)
- Daily expenses
- User settings

Additionally, the app should work offline and sync data with the Supabase backend whenever an internet connection is available.

### 1.2 Objectives

1. **Simplify Table Management** – Provide an interface to add any number of tables, log players in/out, track time or frames, and calculate costs.
2. **Handle Payment Workflows** – Collect payments (cash, online, credit), keep track of outstanding dues, and easily update/clear them.
3. **Track Expenses** – Log daily operational expenses with categories, quantities, and rates.
4. **Enable Offline Use** – Cache interactions locally so the system continues to function without internet. Sync changes to the database once online.
5. **Provide an Easy UI** – Use a collapsible sidebar, straightforward forms, and minimal setup so that clubs can quickly adopt the system.

---

## 2. **High-Level Architecture**

```
                +----------+
  (Browser)      |  PWA     |   <-- Frontend (React or a simple JS app using CDN + Service Worker)
   +-------------+----------+   
   |        Offline Cache   |   <-- IndexedDB or LocalStorage
   |                |
   v                |
+------------------------------------+
|         Service Worker            |
| - Intercepts requests             |
| - Manages offline queue           |
| - Syncs data when online          |
+-----------------+------------------+
                  |
                  v
        +-------------------+
        |   Supabase (DB)  |
        |   + Auth + API   |
        +-------------------+
```

1. **Frontend**: 
   - May use React (or vanilla JS with a Shadcn component library). 
   - Manages the UI: table cards, dashboards, forms. 
   - Deployed as a Progressive Web App (PWA).

2. **Offline Cache**: 
   - Uses **IndexedDB** (or LocalStorage for smaller data) to store user actions (log in/out times, payment details, etc.) when offline.

3. **Service Worker**: 
   - Intercepts network requests, caches assets, and queues up create/update actions if offline.
   - Syncs with the Supabase backend once reconnected.

4. **Supabase**: 
   - Provides the database (PostgreSQL) and user authentication. 
   - Real-time capabilities (optional) for live data updates if needed.

---

## 3. **Detailed Modules & Screens**

### 3.1 **Home Page (Tables Overview)**

**Purpose**: Quickly log a new match, track ongoing games, handle payments, etc.

1. **Table Cards** (initially 7, but can be dynamically added):
   - **Player 1 Name**  
   - **Player 2 Name**  
   - **Login Time** (auto-filled or manually set when user clicks "Log In")  
   - **Logout Time** (auto-filled or manually set when user clicks "Log Out")  
   - **Log In / Log Out Buttons**  
   - **Format Dropdown**  
     - *Per Minute* (₹10/min): The app auto-tracks time from login to logout.  
     - *Per Frame* (₹400/frame): The user specifies number of frames in a dropdown.  
   - **Discount Section**  
     - “Apply Discount” checkbox.  
     - If checked, show input to specify discount (%) => recalculate final price.  
   - **Due Fees**  
     - A dropdown or radio to pick who owes the fees (Player1 or Player2).  
   - **Payment Method**  
     - Cash, Online, Credit.  
   - **New Entry** button to submit the record to the DB.  

**HTML Reference**  
You shared a long snippet that defines `<div id="wf-form-table1" ...>` and so on for table #1, #2, #3, etc. The same pattern continues for each table.  

### 3.2 **Dashboard**

The Dashboard has three main tabs/links:

1. **Ongoing Matches**  
   - Shows a card-like layout for all active matches (where the match is still in progress, or not yet fully paid).  
   - Each card displays:  
     - Table #  
     - Player1 & Player2  
     - Login Time, Logout Time  
     - Format (Per Minute / Per Frame)  
     - Price or Price So Far  
     - Discount (if any)  
     - Payment info (method, partial payment, etc.)  
   - **Actions**:  
     - **Log Out** button: Mark the match as completed.  
     - **Update** button: Update any changes (like discount % or frames).  

   **HTML Reference**  
   - `id="wf-open-record-form-64871103-4783-4e71-862a-ed18a403c532"` (example snippet you provided).  

2. **Outstanding Payments**  
   - Lists matches where the *due fees* are pending.  
   - Columns: Table #, Players, Format, Price, Payment Method, Dues Status.  
   - **Dues Status**: A dropdown to switch from "Pending" to "Paid".  
   - Once set to "Paid," the match is considered settled.  

   **HTML Reference**  
   - `id="wf-clearance-form-b985501b-11bc-4243-b1d1-1718783ef8d6"`  

3. **Completed Matches**  
   - Shows all fully paid or ended matches.  
   - Columns: Table #, Players, Login/Logout, Total Time or Frames, Price, Discount, Final Price, Payment Method.  
   - *Read-only* records of previous matches for the day or historically.  

   **HTML Reference**  
   - `id="wf-completed-record-form-b349e6ee-9428-40a5-9d22-198eb951b542"`  

### 3.3 **Daily Expenses**

**Purpose**: Track club-related expenses (food, maintenance, salaries, utilities, etc.).

1. **Expense Form**  
   - **Description** (string)  
   - **Tag** (food, maintenance, utilities, salary advance, other)  
   - **Quantity** (number)  
   - **Rate** (number, can be float)  
   - **Amount** (auto-calculated => quantity * rate)  
   - **Add** button (submits to database)  

2. **Expenses Table**  
   - Displays existing expense entries in a tabular layout.  
   - Columns: Date, Description, Tag, Quantity, Rate, Amount.  

**HTML Reference**  
- `id="wf-form-expense-form" class="form is-record expense"`  
- `id="expenses-table"`  

### 3.4 **Settings**

**Purpose**: Manage user or admin profile.

1. **User Details**  
   - Name  
   - Email  
   - Phone Number  
   - Description  

2. **Support & Settings** in Sidebar  
   - Expandable at the bottom of the sidebar.  

**HTML Reference**  
- A simple form with `[name, email, phone, description]` inputs.

---

## 4. **Data Model (Supabase)**

Below is a simplified schema suggestion (you can adjust field types as needed):

1. **Users Table**  
   - `id` (uuid, primary key)  
   - `name` (text)  
   - `email` (text, unique)  
   - `phone_number` (text)  
   - `description` (text)  
   - `created_at` (timestamp)  
   - `updated_at` (timestamp)  

2. **Tables** (if you store physical table info, optional)  
   - `id` (uuid, primary key)  
   - `table_no` (integer or text)  

3. **Matches Table**  
   - `id` (uuid, primary key)  
   - `table_no` (text or foreign key to `Tables`)  
   - `player1` (text)  
   - `player2` (text)  
   - `login_time` (timestamp)  
   - `logout_time` (timestamp)  
   - `format` (enum: ['minute', 'frame'])  
   - `no_frames` (integer)  
   - `time_minutes` (integer)   // if needed for total time  
   - `initial_price` (numeric)  
   - `discount_percentage` (numeric)  
   - `final_price` (numeric)  
   - `loser` (enum: ['player1', 'player2', 'none'])  
   - `payment_method` (enum: ['cash', 'online', 'credit'])  
   - `status` (enum: ['ongoing', 'completed', 'pending'])  
   - `created_at` (timestamp)  
   - `updated_at` (timestamp)  

4. **Expenses Table**  
   - `id` (uuid, primary key)  
   - `description` (text)  
   - `tag` (enum: ['food', 'maintenance', 'utilities', 'salary advance', 'other'])  
   - `quantity` (integer)  
   - `rate` (numeric)  
   - `amount` (numeric)  
   - `created_at` (timestamp)  

---

## 5. **Offline Caching & Sync Flow**

1. **Service Worker + IndexedDB**  
   - The service worker intercepts any “Create/Update” request. If offline, it stores the request body in an IndexedDB queue.

2. **Pending Queue**  
   - A local queue that keeps match or expense updates until the connection is reestablished.

3. **Automatic Sync**  
   - When the network is back, the service worker (or a background sync task) iterates over the queue, sending each request to Supabase via REST or RPC calls.  

4. **Data Fetch & UI Refresh**  
   - The frontend (when online) fetches the latest data from Supabase and merges changes.  
   - If offline, it fetches from IndexedDB for local display.

---

## 6. **Technology Choices**

- **Frontend**  
  - **React** or basic **HTML/JS** with a **CDN** for a UI component library (e.g., Shadcn UI).
  - **Service Worker** for offline caching.
  - **IndexedDB** or **LocalStorage** for offline data (IndexedDB is more powerful for structured data).
  - Optional: **Redux Toolkit** or Context API for state management.

- **Backend**: **Supabase**  
  - Database (PostgreSQL).  
  - Auth (Supabase Auth).  
  - Real-time subscriptions if needed.  

- **Deployment**  
  - The frontend can be hosted on Netlify, Vercel, or a static hosting provider.  
  - Supabase handles the database & APIs.  

- **PWA**  
  - Add a `manifest.json` and a service worker to make the app installable on devices.  

---

## 7. **Implementation Plan**

### Phase 1: Core MVP (Approx. 4-6 weeks)

1. **Supabase Setup**  
   - Create database schema (Users, Matches, Expenses).  
   - Set up Auth for user management.  

2. **Home Page (Tables)**  
   - Hardcode 7 table cards initially.  
   - Implement Log In, Log Out, Format selection, Price calculation.  
   - “New Entry” to save the match record to Supabase.  

3. **Dashboard - Ongoing**  
   - Display ongoing matches from DB.  
   - Provide update & logout functionalities.  

4. **Payments**  
   - Basic credit/cash/online selection.  
   - Store in `Matches` table.

### Phase 2: Extended Features (Approx. 2-3 months)

1. **Outstanding Payments & Completed**  
   - Dashboard tabs for filtering matches by status (`pending`, `completed`).  

2. **Daily Expenses**  
   - Form + Table for expenses.  
   - Basic category selections (food, maintenance, etc.).  
   - Summations on the UI if needed.  

3. **Offline-First Implementation**  
   - Service Worker for caching.  
   - IndexedDB for local queue.  
   - Auto-sync logic with Supabase.  

4. **Settings Page**  
   - User info update (name, email, phone, description).  

### Phase 3: Future Scope

1. **External Device Control** (Lights)  
   - Integrate with a local server on Raspberry Pi.  
   - Send requests to toggle table lights on/off.  

2. **Advanced Analytics**  
   - Track daily usage, busiest hours, top players, revenue graphs, etc.  

3. **Mobile App**  
   - Possibly wrap the PWA or build a dedicated native/hybrid app.  

---

## 8. **Screen-by-Screen Summary**

1. **Login (optional)**  
   - Email, Password → Auth with Supabase.

2. **Home Page**  
   - 7 (or more) table cards side-by-side in a responsive grid.  
   - Each card has inputs for players, times, format, discount, payment, etc.  
   - “Log In” button starts the match clock (if per-minute).  
   - “Log Out” button stops the clock.  
   - “New Entry” button saves the record to DB.

3. **Dashboard**  
   - **Ongoing**: Active matches.  
   - **Outstanding**: Matches that have partial or no payment.  
     - Mark as paid.  
   - **Completed**: Historical or fully cleared matches.

4. **Daily Expenses**  
   - Form to add new expense: description, tag, quantity, rate → calculates amount.  
   - Table listing previously recorded expenses.

5. **Settings**  
   - Simple page for user profile: name, email, phone, description.  
   - Possibly show a “Change Password” link if using Supabase Auth.

6. **Sidebar Navigation**  
   - **Home**  
   - **Dashboard** (Ongoing, Outstanding, Completed)  
   - **Daily Expenses**  
   - **Support** / **Settings** (expandable at the bottom)

---

## 9. **Key Offline Considerations**

1. **Caching**  
   - HTML, CSS, JS assets cached by the service worker for faster loads.  
   - Offline states if the user is completely disconnected.  

2. **Local Queues**  
   - For matches: If the user taps “New Entry” but the connection is lost, store that record in IndexedDB.  
   - For expenses: If the user tries to add an expense offline, store it locally and upload later.  

3. **Conflict Resolution**  
   - Typically, last write wins.  
   - The app can display a “sync successful” or “conflict found” (in advanced scenarios) once reconnected.

---

## 10. **HTML Snippets & Integration Notes**

- **Home Page**  
  - Provided code for `<div class="form" id="wf-form-table1"> ... </div>` repeating for tables #1 to #7.  
  - The `<button id="new_entry_tableX">` triggers a function that either sends data directly to Supabase or queues it if offline.

- **Dashboard**  
  - Provided code for “ongoing,” “outstanding,” and “completed” records with `<div class="form is-record"> ...`.  
  - Key IDs like `update_record_*`, `logout_*`, etc. handle button actions in JS.

- **Daily Expenses**  
  - Provided code for `<div id="wf-form-expense-form" class="form is-record expense"> ...`  
  - The list of recorded expenses is in `<div id="expenses-table"> ... </div>`.

---

## 11. **Future Enhancements**

1. **Lighting Control**  
   - Create an API endpoint on a local Raspberry Pi that toggles relay switches for table lights.  
   - Integrate the toggle in the “Table Card” UI.  

2. **Analytics & Reports**  
   - Summaries of daily revenue, monthly expenses.  
   - High-level insights into occupancy times.  

3. **Multi-Club Support**  
   - If one user manages multiple clubs, add location/club data to the tables and matches.  

4. **Advanced Payment Plans**  
   - E.g., membership-based rates, multi-frame discounts, etc.

---

## 12. **Conclusion**

This **Snooker Club Management Application** encompasses core modules to handle day-to-day snooker club operations—covering table reservations, match logging, time/frame-based billing, outstanding & completed matches, daily expenses, and user settings. The solution’s offline-first design ensures business continuity even without stable internet, seamlessly syncing data to Supabase whenever the network is restored.

---

### **End of Document**

This detailed document should serve as a strong foundation for planning and implementing your snooker club management system. It covers both the essential features and the technical considerations (offline caching, Supabase integration, future expansions, and screen-by-screen layouts).