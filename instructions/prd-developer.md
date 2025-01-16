Below is a **Developer Implementation Guide** that focuses on **Front-End User Flows** and **Detailed Instructions**. The goal is to help a front-end developer understand each screen, how the user navigates through the app, and what functionality is expected at each step. We’ll highlight **Shards (Shadcn UI)** (or “shard cn”) as the UI component library to be used, though the exact library references can be swapped as needed. You can adapt the naming conventions (class names, component names) to match your project’s structure.

---

# Developer Implementation Guide

## 1. **Authentication Flows**

### 1.1 **Sign Up**

**Purpose**  
Allow a new user (club owner or staff) to create an account.

**User Flow**  
1. **User clicks “Sign Up”**: 
   - Display a **Sign Up** form with fields:
     - **Name** (full name)
     - **Email**
     - **Password** (with confirmation, if required)
   - You may also include a **Phone Number** or **Description** if desired.

2. **Validation**:
   - Ensure all fields are filled.
   - Validate that email is in correct format.
   - Password meets minimum strength requirements (if any).

3. **Submit**:
   - On submission, call **Supabase Auth** (or whichever backend) to register the user.
   - If successful, redirect to **Home Page** or prompt for Email Verification (if applicable).

4. **UI Components**:
   - Shards UI:
     - Use a `Form` component with `FormInput`, `FormGroup`, `Button`, etc.
   - Example structure:
     ```jsx
     <Form>
       <FormGroup>
         <label>Name</label>
         <FormInput type="text" placeholder="Enter your name" />
       </FormGroup>
       <FormGroup>
         <label>Email</label>
         <FormInput type="email" placeholder="Enter your email" />
       </FormGroup>
       <FormGroup>
         <label>Password</label>
         <FormInput type="password" placeholder="Enter a password" />
       </FormGroup>
       <Button type="submit">Sign Up</Button>
     </Form>
     ```

### 1.2 **Log In**

**Purpose**  
Allow an existing user to access the main app.

**User Flow**  
1. **User visits Log In page**: 
   - Shown a **Login** form with:
     - **Email**
     - **Password**  

2. **Validation**:
   - Check if email & password are non-empty.

3. **Submit**:
   - Call **Supabase Auth** sign-in method with email & password.
   - If successful, route to **Home Page** (Tables Overview).

4. **UI Components**:
   - Similar structure to Sign Up, just simplified:
     ```jsx
     <Form>
       <FormGroup>
         <label>Email</label>
         <FormInput type="email" />
       </FormGroup>
       <FormGroup>
         <label>Password</label>
         <FormInput type="password" />
       </FormGroup>
       <Button>Log In</Button>
     </Form>
     ```

### 1.3 **Forgot Password**

**Purpose**  
Help users reset their password if they forget.

**User Flow**  
1. **User clicks “Forgot Password?”** link on the Login screen.
2. **Password Reset Form**:
   - Only asks for **Email**.
3. **Submit**:
   - Call Supabase (or your backend) to send a password reset email.
   - Display a success message: “Please check your inbox to reset your password.”
4. **UI Components**:
   ```jsx
   <Form>
     <FormGroup>
       <label>Enter your email</label>
       <FormInput type="email" />
     </FormGroup>
     <Button>Send Password Reset</Button>
   </Form>
   ```

---

## 2. **Home Page (Tables Overview)**

**Purpose**  
Quickly let staff manage each snooker table (log players in/out, track time, frames, discount, etc.).

**Key Sections**  
- **Sidebar** (collapsible) with links: Dashboard, Daily Expenses, Support, Settings.
- **Table Cards** in a grid layout (initially 7 cards, can add more).

### 2.1 **Table Card Layout**

Each **Table Card** typically includes (as per HTML provided):

1. **Table #** (e.g., “Table #1”)
2. **Player 1 Name** & **Player 2 Name** (text inputs)
3. **Login Time** & **Logout Time** (read-only, auto-filled or user-clicked)
4. **Log In / Log Out Buttons** 
5. **Format** dropdown
   - **Per Minute** (calculates price = time * ₹10)
   - **Per Frame** (price = frames * ₹400)
6. **No. of Frames** dropdown (visible only if format = “Per Frame”)
7. **Total Time** (read-only if format = “Per Minute”)
8. **Initial Price** (auto-calculated based on the format/time/frames)
9. **Apply Discount** checkbox
   - If checked: **Discount** field (a % input) + **Price After Discount**
10. **Due Fees** (loser: Player 1 or Player 2)
11. **Payment Method** (cash, online, credit)
12. **New Entry** button to save data to the DB.

**User Flow**  
1. **Staff enters Player1 & Player2**.
2. **Clicks “Log In”**:
   - Sets `login_time` to current time.
   - If “Per Minute” is chosen, start a local timer to track how many minutes pass until “Log Out.”
3. **Upon “Log Out”**:
   - Sets `logout_time` to current time.
   - The app calculates total time (if per-minute).
   - Or if “Per Frame,” references the selected number of frames.
4. **(Optional) Apply Discount**:
   - Check the box, enter a discount % → auto-calculate new final price.
5. **(Optional) Due Fees**:
   - Mark who will owe the fees (if partial or full credit is used).
6. **Payment Method**:
   - Select the method. If it’s “Credit,” that may show up in “Outstanding Payments” in the dashboard later.
7. **Click “New Entry”**:
   - Submits all data to the backend.
   - Resets the table card UI or displays a success message.

**Technical Notes**  
- Use shadcn UI components (`Card`, `CardBody`, `Form`, `FormInput`, `FormSelect`, `Button`, `Checkbox`).
- Maintain local React state or a store (like Redux) for each table’s data.
- If offline, queue the new entry in IndexedDB. When online, push it to Supabase.

---

## 3. **Dashboard**

Accessed via the sidebar. Contains three tabs/links:

1. **Ongoing Matches**  
2. **Outstanding Payments**  
3. **Completed Matches**

### 3.1 **Ongoing Matches**

**Purpose**  
Show all active or in-progress matches.

**Layout**  
- A list of “match cards” or “rows” for each ongoing match:
  - **Table #**
  - **Player1 & Player2**
  - **Login Time, Logout Time**
  - **Format (min/frame)**
  - **Duration / Frames** if known
  - **Discount** applied or not
  - **Payment Method** (if chosen)
  - **Actions**:
    - **Log Out** (if the user never clicked “Log Out” on the Home Page)
    - **Update** – If the user wants to change discount, frames, or payment method, etc.

**User Flow**  
1. **Staff opens “Ongoing Matches”**.  
2. **Views each active match**.  
3. **If ready to finalize**:
   - Click **Log Out** to set logout time (if it wasn’t set).
   - Update the record if needed.  
4. **UI**:
   - Could be a series of `Cards` or a table listing all ongoing matches.

### 3.2 **Outstanding Payments**

**Purpose**  
Show matches for which the user has chosen “credit” or there is still partial payment due.

**Layout**  
- Similar list or cards:
  - **Table #, Players, Format, Price, Payment Method**  
  - **Dues Status** (Pending / Paid)  
  - “Update” button if you want to confirm payment.

**User Flow**  
1. **Staff opens “Outstanding Payments”**.  
2. **Finds the match** that is pending.  
3. **Selects “Paid”** from the dropdown or uses an action to mark as paid.  
4. **Update** → sends to DB, changes match status to “completed.”

### 3.3 **Completed Matches**

**Purpose**  
Historical record of fully paid or ended matches.

**Layout**  
- Possibly a read-only table or list:
  - **Table #**
  - **Players**
  - **Login/Logout Times**
  - **Format** & **No. of Frames** or **Minutes**
  - **Discount** & **Final Price**
  - **Payment Method**
  - **Date** of match
- No action buttons, purely for reference.

---

## 4. **Daily Expenses**

**Purpose**  
Record operational expenses for the club.

### 4.1 **Add Expense Form**

Fields:
1. **Description** (string)
2. **Tag** (dropdown: `food`, `maintenance`, `utilities`, `salary advance`, `other`)
3. **Quantity** (integer)
4. **Rate** (numeric)
5. **Amount** (auto-calc => quantity * rate)

**User Flow**  
1. **Staff opens “Daily Expenses”** from the sidebar.  
2. **Enters new expense** details in the form.  
3. **Clicks “Add”** to save in the DB.  
   - If offline, store in local queue and sync later.  

### 4.2 **Expenses Table**

- Lists previously recorded expenses in descending order (recent first).
- Columns: **Date**, **Description**, **Tag**, **Quantity**, **Rate**, **Amount**.

**UI Components**:
- Use Shards UI table components, or custom table with `Table`, `thead`, `tbody`, etc.

---

## 5. **Settings**

**Purpose**  
Manage user profile details.

**User Flow**  
1. **Click “Settings”** in the Sidebar.  
2. **Fields**:
   - **Name**
   - **Email** (read-only if already verified?)
   - **Phone Number**
   - **Description** (optional bio or role)
3. **Save Changes**:
   - Update user’s row in Supabase (or whichever user data store).
   - If offline, queue the update.

**UI**:
- Typically, a simple form within a `Card` or `Container`.  
- `<Button>Save</Button>` triggers the update.

---

## 6. **Sidebar & Navigation**

**Purpose**  
Consistent app-wide navigation.

**Sections**:
1. **Logo/Brand** (top)  
2. **Links**: 
   - **Home** (Tables Overview)  
   - **Dashboard**  
     - Ongoing Matches
     - Outstanding Payments
     - Completed
   - **Daily Expenses**
   - *(Expandable Footer)*  
     - **Support**
     - **Settings**

**Technical Points**  
- If using Shards UI for a sidebar, you can adapt their `Navbar`, `NavLink`, or `SideNav` components.
- The “expandable” area (Support/Settings) could be a collapsible section or just plain links at the bottom.

---

## 7. **Offline-First & Sync Logic**

**High-Level Flow**:
1. **Check Connectivity**:
   - If *online*, send form data to Supabase immediately.
   - If *offline*, store the data in IndexedDB or a local queue (Redux store with offline plugin, or a custom solution).

2. **Service Worker**:
   - Caches static assets (HTML/JS/CSS) for offline use.
   - Listens for network changes.
   - When back online, triggers a **sync** event.

3. **Sync**:
   - Reads the local queue of pending actions (new matches, updated matches, new expenses, etc.).
   - Sends them to Supabase via API calls.
   - Clears the queue once confirmed.

4. **Front-End**:
   - If offline, show a small alert like “Offline Mode: data will be synced when online.”
   - On re-connect, automatically refresh the data from the server to ensure consistency.

---

## 8. **Recommended Directory Structure**

Below is one potential approach (if using React). Adapt as needed:

```
/src
  /components
    Sidebar.js
    TableCard.js
    MatchCard.js
    ExpenseForm.js
    ExpenseTable.js
    ...
  /pages
    SignUp.js
    LogIn.js
    ForgotPassword.js
    Home.js
    Dashboard.js
      - OngoingMatches.js
      - OutstandingPayments.js
      - CompletedMatches.js
    DailyExpenses.js
    Settings.js
  /services
    supabaseClient.js   // or supabase.js
    offlineQueue.js     // local queue & service worker sync logic
  /styles
    shards-overrides.scss // or css overrides for Shards UI
  index.js
  App.js
  service-worker.js
```

---

## 9. **Notes on Shards UI (shard cn)**

- **Import** Shards in `index.js` or in the main layout component:
  ```jsx
  import 'shards-ui/dist/css/shards.min.css';
  ```
- **Usage** examples:
  ```jsx
  import { Card, CardBody, Form, FormGroup, FormInput, Button } from "shards-react";

  const Example = () => (
    <Card>
      <CardBody>
        <Form>
          <FormGroup>
            <label htmlFor="player1">Player 1 Name</label>
            <FormInput id="player1" placeholder="Enter Player 1" />
          </FormGroup>
          ...
          <Button>Submit</Button>
        </Form>
      </CardBody>
    </Card>
  );
  ```

- **Grid & Layout**:
  - Use `Container`, `Row`, `Col` from Shards for responsive layout.

---

## 10. **Developer Implementation Steps (Summary)**

1. **Set up Supabase** (or verify environment variables for your dev environment).
2. **Initialize React App** (or your framework of choice) with Shards UI installed.
3. **Implement Authentication** (Sign Up, Log In, Forgot Password):
   - Set up routes: `/signup`, `/login`, `/forgot-password`.
   - Connect to Supabase Auth methods.
4. **Create the Home Page**:
   - Display 7 default `TableCard` components in a grid layout.
   - Add logic to add more tables dynamically (a “+ Add Table” button).
   - Each `TableCard` handles its own form state (player names, times, discount, payment method, etc.).
5. **Build the Dashboard**:
   - Use 3 sub-routes or tabs: `/dashboard/ongoing`, `/dashboard/outstanding`, `/dashboard/completed`.
   - Display the lists of matches in each sub-route, fetch from DB or offline cache.
   - Implement “Update” and “Log Out” actions for ongoing matches, “Paid” actions for outstanding payments.
6. **Daily Expenses**:
   - Create a form for new expenses. Implement auto-calculation of `amount`.
   - Show a table or list of existing expenses.
7. **Settings**:
   - Build a user profile form. Pre-populate from the user’s data in Supabase.
   - Implement a “Save” that updates Supabase or the offline queue if no connection.
8. **Sidebar & Navigation**:
   - Implement a persistent sidebar component.
   - Route each link to the correct page (React Router or your routing choice).
   - Make sure “Support” / “Settings” are at the bottom (collapsible or static).
9. **Offline Functionality**:
   - Add a service worker to your app.
   - Implement an offline queue with IndexedDB (or a library like `localforage`).
   - Make sure new entries or updates are stored offline if no network, then synced later.
10. **Testing & Deployment**:
    - Test sign-up/login flows.
    - Test table logging, discount logic, payment method handling.
    - Verify offline usage: turn off the network and see if the UI still works, then re-connect to see if data syncs.

---

## 11. **Conclusion**

These detailed user flows and screen-by-screen instructions should give any developer (especially front-end) clarity on what to build, how the components will interact, and how users will navigate the app. By leveraging **Shards UI** (shard cn) for styling and **Supabase** for your backend (plus offline logic with service workers), you can create a smooth, modern, and offline-capable snooker club management experience. 

Happy coding!