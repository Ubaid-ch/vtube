# VTube

VTube is a full-stack video-sharing application inspired by YouTube. It features user authentication, video uploading, commenting, tweeting, subscribing, and liking.

## Project Structure

This repository contains both the backend and frontend components of the application, separated into two distinct folders:

### 1. `backend/`
The backend is built with **Node.js, Express.js, and MongoDB**. It serves as the API for the application and handles data persistence, authentication, video processing (via Cloudinary), and business logic.

**Key Technologies:**
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for authentication
- Cloudinary for media storage
- Multer for file uploads

**How to run locally:**
```bash
cd backend
npm install
npm run dev
```
*Note: Make sure to set up your `.env` file in the backend folder with the required MongoDB URI, Cloudinary credentials, and JWT secrets.*

### 2. `frontend/`
The frontend is a modern web application built with **Next.js and React**. It provides a dynamic and responsive user interface for users to interact with the platform.

**Key Technologies:**
- Next.js (App Router)
- React
- Axios (for API requests)
- Vanilla CSS for styling

**How to run locally:**
```bash
cd frontend
npm install
npm run dev
```

## Features
- **User Authentication:** Secure signup and login flow with JWT.
- **Video Management:** Upload, update, delete, and view videos.
- **Subscriptions:** Subscribe to your favorite channels and view their content.
- **Social Features:** Like videos, add comments, and post tweets to your community feed.
- **Channel Profiles:** View personalized channel pages with user details and statistics.
