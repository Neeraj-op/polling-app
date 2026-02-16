Real-Time Poll Rooms:

A full-stack web application for creating and sharing real-time polls with instant vote updates using WebSockets.


1. Features:
Create Polls: Easy poll creation with custom questions and multiple options
Real-Time Updates: See vote results update instantly across all connected clients
Shareable Links: Each poll gets a unique URL for easy sharing
Fair Voting: Built-in anti-abuse mechanisms to prevent duplicate votes
Persistent Storage: All polls and votes are stored in PostgreSQL
Modern UI: Clean, responsive interface with smooth animations

2. Fairness Mechanisms
This application implements two distinct anti-abuse mechanisms to ensure fair voting:
    2.1. IP-Based Limiting:
            What it prevents: Multiple votes from the same network/location
            How it works:

            Extracts the client's IP address from each vote request
            Stores IP address with vote record in the database
            Uses database constraint to prevent duplicate IP+poll combinations
            Handles proxy headers (X-Forwarded-For) for accurate IP detection

            Limitations:

            Users on the same network (e.g., office, school) share an IP
            Users with dynamic IPs could potentially vote again after IP change
            VPN/proxy users can bypass by changing IP

            2.2 Browser Fingerprint Limiting
            What it prevents: Multiple votes from the same browser/device
            How it works:

            Generates a unique fingerprint using browser characteristics like:

            User agent string
            Screen resolution
            Timezone


            Fingerprint stored in sessionStorage and sent with votes
            Database constraint prevents duplicate fingerprint+poll combinations

            Limitations:

            Users can bypass by using different browsers (Chrome, Firefox, Safari)
            Incognito/private browsing creates new fingerprints
            Clearing browser data resets the fingerprint
            Not foolproof against determined attackers

    Combined Protection
    By using both mechanisms together:

    Casual duplicate voting is effectively blocked
    Multiple bypass methods would be needed simultaneously
    Provides reasonable protection for typical use cases
    Balance between security and user experience (no login required)

3. Additional Future Considerations

User authentication (OAuth, email verification)
CAPTCHA for vote submission
Rate limiting per IP address
Time-based voting windows

4. Tech Stack

Backend

Python 3.11+
Django 5.0 - Web framework
Django REST Framework - API endpoints
Django Channels - WebSocket support
PostgreSQL - Database
Redis - Channel layer for real-time messaging
Daphne - ASGI server

Frontend

React 18 - UI library
Vite - Build tool and dev server
React Router - Client-side routing
Axios - HTTP client
WebSocket API - Real-time communication

Deployment

Render - Backend hosting
Vercel - Frontend hosting
Upstash Redis - Managed Redis


