# Nua Assignment - Full Stack File Sharing Application

## Features

- **User Authentication**: Register, login, and JWT-based authentication
- **File Upload**: Upload multiple files (images, PDFs, CSVs, etc.) with size validation
- **File Management**: View, download, and delete uploaded files
- **File Sharing**: 
  - Share files with specific users
  - Generate shareable links (authenticated users only)
  - Set expiry dates for shared access
- **Access Control**: Strict authorization checks for all file access
- **Bonus Features**:
  - Link expiry functionality
  - Basic audit logging
  - File metadata display

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- React Dropzone for file uploads

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Helmet for security headers
- Compression for response compression

## Prerequisites

- Node.js 
- MongoDB
- npm or yarn

## Installation & Setup

```bash
1.
git clone 
cd nua-assignment

2. Install dependencies
cd server && npm install
cd ../client && npm install

3. Start MongoDB 
mongod

4. Run backend (in server directory)
npm run dev

5. Run frontend (in client directory, new terminal)
npm start