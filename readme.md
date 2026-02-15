🏗️ Architecture & Tech Stack

➡️ FRONTEND: React (Vite), Redux Toolkit, Framer Motion, CSS.
➡️ BACKEND: Node.js, Express.js.
➡️ REAL TIME - ENGINE: Socket.io (WebSockets) for bi-directional event-based 
   communication.
➡️ DATABASE: MongoDB (Atlas) for persistent storage and REDIS for rate-limiting.
➡️ STATE MANAGEMENT: Redux (Global State) + React Hook Form (Uncontrolled Inputs).

🛡️ Fairness & Anti-Abuse Mechanisms (The "Two-Layer Defense")

To satisfy the requirement of "fairness" without forcing users to create an account (which lowers conversion), I implemented a tiered security approach:

🟢 Client-Side "Soft" Lock (UX Focused) -> Mechanism: LocalStorage Persistence.

👉 Implementation: When a user votes, a unique key (poll_voted_{id}) is stored in the browser's local storage. On page load, the application checks for this key and instantly disables the voting UI.

Purpose: Prevents accidental and intentional double-submissions and provides immediate visual feedback to the user, improving the User Experience (UX).

🟢 Server-Side IP Verification (Security Focused) -> Mechanism: IP Address Tracking & Normalization.

👉 Implementation:

The backend extracts the real IP address from the socket handshake (socket.handshake.address or x-forwarded-for).

IPv6 Normalization: Handles dual-stack network issues by normalizing local IPv6 addresses (::1) to IPv4 (127.0.0.1) to prevent spoofing.

Atomic Check: Before recording a vote, the server queries the votedIps array in the MongoDB document. If the IP exists, the request is rejected immediately.

Purpose: Prevents users from bypassing the client-side lock by using "Incognito Mode", clearing their cache, or using different browsers on the same machine.

⚡ Edge Cases Handled

➜ Race Conditions (Concurrency)
The Risk: If 100 users vote for "Option A" at the exact same millisecond, a standard read-modify-write operation would result in data loss (only 1 vote counted instead of 100).

▶️ The Solution: Implemented MongoDB Atomic Operators ($inc, $push). The database handles the locking and incrementing internally, ensuring 100% data integrity even under heavy load.

➜ Network Normalization (The "Localhost Trap")
The Risk: A user could vote once via IPv4 (127.0.0.1) and again via IPv6 (::1), bypassing the IP check.

▶️ The Solution: Implemented a normalization utility in the socket handler to treat both addresses as a single identity.

➜ Basic Double Voting:
The Risk: A user clicks "Vote" twice rapidly.

▶️ The Solution: Our frontend "Optimistic UI" disables the button immediately, and your backend checks the IP before writing to the DB.

➜ Incognito Mode / Cache Clearing:
The Risk: A user clears their browser cache to bypass LocalStorage.

▶️ The Solution: Our backend IP check catches them.

➜ Server Crashes:
The Risk: The server restarts mid-vote.

▶️ The Solution: Data is persistent in MongoDB, not in memory.

⚠️ Known Limitations & Future Improvements
While the current system is robust for the assignment's scope, the requirement for anonymity (no login) introduces specific trade-offs:

➡️ Shared Network (NAT) Restriction:

Limitation: Users on the same public WiFi (e.g., offices, dorms) share a single public IP. If one user votes, others on the same network may be blocked.

Future Improvement: Implement Browser Fingerprinting (using canvas/audio context) to identify devices uniquely, or add an optional "Login via Google" for users on shared networks.

➡️ Socket Event Rate Limiting:

Limitation: Our current rateLimiter middleware protects HTTP Routes (POST /createPoll). However, it does not protect our Socket Events. A hacker could write a script to connect to our socket and emit the vote event 1,000 times per second. Even though our DB logic will reject the votes (because of the IP check), our Database still gets hit with 1,000 queries to check that IP, potentially slowing it down.

Future Improvement: Implement a Token Bucket algorithm specifically for the socket.on('vote') event handler using Redis to ban abusive socket IDs.

➡️ VPN Spoofing:

Limitation: A user can vote, turn on a VPN (changing their IP), vote again, switch VPN servers, and vote again. It is very hard to stop without requiring a verified phone number or Login.

Future Improvement: Integrate a third-party IP Reputation API to detect and block traffic from known VPN/Proxy exits.