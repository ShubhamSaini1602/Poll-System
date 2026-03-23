#  PollSync — Real-Time Polling Like WhatsApp

## 🏗️ Architecture & Tech Stack

### Frontend
- React (Vite)  
- Redux Toolkit  
- Framer Motion  
- CSS  

### Backend
- Node.js  
- Express.js  

### Real-Time Engine
- Socket.io (WebSockets) for bi-directional event-based communication  

### Database
- MongoDB (Atlas) for persistent storage  
- Redis for rate-limiting  

### State Management
- Redux (Global State)  
- React Hook Form (Uncontrolled Inputs)  

---

## 🛡️ Fairness & Anti-Abuse Mechanisms (Two-Layer Defense)

To ensure fairness without forcing user authentication (which reduces conversion), a **tiered security approach** is implemented:

---

### 🟢 Client-Side "Soft" Lock (UX Focused)

**Mechanism:** LocalStorage Persistence  

**Implementation:**
- When a user votes, a unique key (`poll_voted_{id}`) is stored in browser localStorage  
- On page load, the app checks this key and disables the voting UI  

**Purpose:**
- Prevents accidental or repeated submissions  
- Provides instant feedback to the user  
- Enhances overall user experience  

---

### 🟢 Server-Side IP Verification (Security Focused)

**Mechanism:** IP Address Tracking & Normalization  

**Implementation:**
- Extracts real IP from:
  - `socket.handshake.address`  
  - `x-forwarded-for` header  
- Handles IPv6 normalization:
  - `::1` → `127.0.0.1`  
- Performs atomic check in MongoDB:
  - If IP exists in `votedIps`, request is rejected  

**Purpose:**
- Prevents bypass via:
  - Incognito mode  
  - Cache clearing  
  - Multiple browsers  

---

## ⚡ Edge Cases Handled

### ➜ Race Conditions (Concurrency)

**The Risk:**  
Simultaneous votes may overwrite each other in standard read-modify-write operations  

**Solution:**  
- Used MongoDB atomic operators:
  - `$inc` (increment votes)  
  - `$push` (store IPs)  
- Ensures **100% data consistency under high load**  

---

### ➜ Network Normalization (Localhost Trap)

**The Risk:**  
Users can vote via IPv4 (`127.0.0.1`) and IPv6 (`::1`) separately  

**Solution:**  
- Normalize both to a single identity before validation  

---

### ➜ Basic Double Voting

**The Risk:**  
User clicks vote multiple times rapidly  

**Solution:**  
- Frontend disables button instantly (Optimistic UI)  
- Backend validates IP before DB write  

---

### ➜ Incognito Mode / Cache Clearing

**The Risk:**  
User clears localStorage to bypass client lock  

**Solution:**  
- Server-side IP verification prevents duplicate voting  

---

### ➜ Server Crashes

**The Risk:**  
Votes lost if stored in memory  

**Solution:**  
- Persistent storage using MongoDB  

---

## ⚠️ Known Limitations & Future Improvements

While the system is robust, anonymous usage introduces trade-offs:

---

### ➜ Shared Network (NAT) Restriction

**Limitation:**  
Users on the same WiFi share one IP → only one vote allowed  

**Future Improvement:**  
- Browser Fingerprinting (Canvas / Audio context)  
- Optional "Login with Google" for identity differentiation  

---

### ➜ Socket Event Rate Limiting

**Limitation:**  
HTTP routes are protected, but socket events are not  
- Malicious users can spam vote events  
- DB still gets hit even if votes are rejected  

**Future Improvement:**  
- Implement Token Bucket algorithm  
- Use Redis to rate-limit `socket.on('vote')` events  
- Ban abusive socket IDs  

---

### ➜ VPN Spoofing

**Limitation:**  
Users can change IP using VPN and vote multiple times  

**Future Improvement:**  
- Integrate IP reputation APIs  
- Detect and block VPN / proxy traffic  
- Optional verified login system  

---
