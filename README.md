# AuraEvents - Event Management System

AuraEvents is a professional, industry-grade, and visually stunning Event Management and Pass Ticketing System built using React, Node.js, Express, and MongoDB. 

Designed with modern dark-themed aesthetics, glassmorphism, and responsive layouts, it provides a seamless user experience for discovering events, booking tickets with simulated payment flows, managing gate check-ins with client-side QR scanning, and monitoring sales data via an interactive analytics dashboard.

---

## 🌟 Key Features

1. **Event Discovery**
   - Live searchable and filterable catalog.
   - Categorized layout (Technology, Entertainment, Arts & Culture, Food & Drink, Sports, Business).
   - Visual remaining ticket counts with color-coded alerts when sold out or near capacity.

2. **Secure Ticket Booking & Simulated Payments**
   - Dynamic price calculation based on ticket quantity.
   - **Limit of 10 tickets per email** per event enforced at the database level.
   - **Credit Card Option**: Validates that the credit card is exactly 16 digits. Shows a simulated secure AES-256 PCI bank gateway transition.
   - **Scan QR Option**: Generates a mock payment UPI QR code with a click-to-confirm gateway interface.
   - **Pass Printing**: Spawns a clean print window to print or save the cryptographic digital gate pass as a PDF.

3. **Organizer Authentication & Event Creation**
   - Simulated register/login portal stored securely in `localStorage` to authorize organizers.
   - Event creation dashboard with real-time card preview and preset category banners.

4. **Gate QR Check-in System**
   - **Interactive Simulation**: Instantly click "Simulate Scan" to check in active tickets.
   - **Manual Key-in**: Enter the alphanumeric pass ticket reference code.
   - **QR Image Upload**: Upload the saved ticket QR code image file to scan, parsed entirely client-side using the MIT-licensed `jsqr` library (no paid modules required).
   - Enforces check-in state, showing original scan timestamps and double-scan warnings to prevent reuse.

5. **Real-time Analytics Dashboard**
   - KPI metrics: Gross Revenue, Tickets Issued, Gate Attendance Rate, and Active Event Counts.
   - **Revenue Growth Stream**: Interactive line chart showing cumulative sales trends.
   - **Ticket Allocations**: Interactive bar chart comparing tickets sold vs event capacities.
   - **Gate Attendance Ratio**: Interactive doughnut chart representing checked-in vs absent attendees.
   - Detailed, sortable tabular ledger of all events, pricing, category badges, and total sales.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite SPA), custom Vanilla CSS (Theme variables, transitions, and responsive grid layouts).
- **Icons**: Lucide React.
- **Charts**: Chart.js & React-Chartjs-2.
- **QR Decoding**: jsQR.
- **Backend**: Node.js, Express.js, Cors.
- **Database**: MongoDB (via Mongoose) with automatic local JSON file fallback.
- **Orchestration**: Concurrently.

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB checker & local JSON fallback manager
│   ├── models/
│   │   ├── Event.js         # Event DB model wrapper
│   │   └── Booking.js       # Booking DB model wrapper
│   ├── routes/
│   │   ├── events.js        # Event endpoints (retrieval & creation)
│   │   ├── bookings.js      # Ticket limits, 16-digit cards, check-in gates
│   │   └── analytics.js     # Summaries, trends, and ChartJS data compilers
│   ├── db_fallback.json     # Generated offline data fallback ledger
│   ├── package.json
│   └── server.js            # Server launcher and initial seeding
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventCreationForm.jsx   # Auth Gate + Creator Form + Live Preview
│   │   │   ├── TicketBookingModal.jsx  # Price Math + 16-Digit Card + Print Window
│   │   │   ├── QRScanner.jsx           # Gate Check-ins + jsQR File Uploader
│   │   │   └── MyTickets.jsx           # Pass retrieval via email
│   │   ├── App.jsx          # Tab router & hero layout
│   │   ├── index.css        # Cosmic dark theme variables & animations
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js       # Proxies API calls to port 5000
│   └── package.json
├── package.json             # Workspace entry configuration
└── README.md
```

---

## ⚡ Setup & Launch Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and npm installed.

### 1. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```
This will automatically install the root dependencies and cascade down to install the packages for both the `backend` and the `frontend` directories.

### 2. Configure Environment (Optional)
The backend is configured to read from a `.env` file in the `backend/` directory. By default, it expects:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/event_management
```

### 3. Database Fallback (Zero Config Mode)
If you don't have MongoDB installed or running, **no configuration is required**. The application detects this on startup, automatically logs a warning, and falls back to saving data into a local JSON database (`backend/db_fallback.json`). You can run, book, edit, and check in tickets immediately!

### 4. Run the Application
Start both the client and server concurrently:
```bash
npm run dev
```

- **Frontend client** is served on **http://localhost:3000**
- **Backend server** is served on **http://localhost:5000**

---

## 🔒 Verification & Fake Payment Rules
- **16-Digit Card Checking**: In the Card checkout, the system expects exactly 16 digits. Spacing is automatically handled (e.g. `1234 5678 9012 3456`). Inputs with incorrect lengths are blocked with a clear warning display.
- **Pass Printing**: Clicking print opens a secure separate tab rendering the ticket and prompts the browser print prompt automatically, saving you from downloading any heavy dependencies.
- **QR Scanning**: Download the generated QR code or take a screenshot, and drag it into the Check-in upload panel. The system will read the pixel data using `jsQR` and trigger gate authentication.
