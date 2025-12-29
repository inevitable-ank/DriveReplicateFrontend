# 🚀 TwoSpoon - Cloud Storage & File Management Platform

A modern, full-featured cloud storage and file management application built with Next.js, providing a Google Drive-like experience with file upload, sharing, organization, and collaboration features.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Available Scripts](#-available-scripts)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication
- **User Registration & Login** - Secure email/password authentication
- **Google OAuth Integration** - One-click sign-in with Google
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Session Management** - Persistent authentication with token-based sessions

### 📁 File Management
- **File Upload** - Drag-and-drop or click to upload files
- **Folder Creation** - Organize files in nested folder structures
- **File Operations**:
  - ✏️ Rename files and folders
  - 🗑️ Delete files (move to trash)
  - 📋 Copy files
  - 📥 Download files
  - 👁️ Preview files in browser
- **Breadcrumb Navigation** - Easy folder navigation
- **File Grid View** - Visual file browser with icons

### 🔍 Search & Filter
- **Full-Text Search** - Search across all your files
- **Advanced Filters**:
  - Filter by file type (all, documents, images, videos, etc.)
  - Filter by sharing status
  - Filter by modification date

### 👥 Sharing & Collaboration
- **Share with Users** - Share files with specific users via email
- **Shareable Links** - Generate public or private share links
- **Permission Control** - Set view or edit permissions
- **Shared Files View** - Access files shared with you
- **Share Management** - Revoke access or remove share links

### 📊 Storage Management
- **Storage Quota** - 15GB default storage limit
- **Storage Usage Display** - Visual indicator of storage consumption
- **File Information** - Detailed file metadata and properties

### 🎨 User Interface
- **Modern Design** - Clean, intuitive interface built with Tailwind CSS
- **Responsive Layout** - Works seamlessly on desktop and mobile
- **Sidebar Navigation** - Quick access to:
  - Home
  - My Drive
  - Computers
  - Shared with me
  - Recent files
  - Starred files
  - Spam
  - Trash
- **Context Menus** - Right-click actions for files
- **Toast Notifications** - User-friendly feedback for actions
- **File Icons** - Visual file type indicators

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.2.3](https://react.dev/)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
  - Dialog
  - Label
  - Tabs
  - Slot
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**:
  - `clsx` - Conditional class names
  - `class-variance-authority` - Component variants
  - `tailwind-merge` - Tailwind class merging

### Development Tools
- **Linting**: ESLint with Next.js config
- **Package Manager**: pnpm (workspace support)
- **Build Tool**: Next.js built-in bundler

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8.0.0 or higher) - [Installation Guide](https://pnpm.io/installation)
  ```bash
  npm install -g pnpm
  ```
- **Backend API** - This frontend requires a backend API server running
  - Default API URL: `http://localhost:5000/api`
  - See [API Integration](#-api-integration) section for details

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd Twospoon/app_v1
```

### Step 2: Install Dependencies

Using pnpm (recommended):

```bash
pnpm install
```

Alternatively, using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the `app_v1` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google OAuth (if using Google sign-in)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

> **Note**: The `.env.local` file is not tracked by git. Make sure to create it based on your environment.

---

## ⚙️ Configuration

### API Configuration

The application expects a backend API server. Configure the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, update this to your production API URL:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Google OAuth Setup (Optional)

If you want to enable Google OAuth authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Add the Client ID to your `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🏃 Running the Project

### Development Mode

Start the development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

### Linting

Run ESLint to check for code issues:

```bash
pnpm lint
```

---

## 📁 Project Structure

```
app_v1/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes (if any)
│   │   └── auth/
│   │       └── signup/
│   ├── auth/
│   │   └── callback/            # OAuth callback handler
│   │       └── page.tsx
│   ├── dashboard/                # Main dashboard
│   │   └── page.tsx
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── signup/                   # Signup page
│   │   └── page.tsx
│   ├── shared/                   # Shared file viewer
│   │   └── [token]/
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects to login)
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── drive/                    # Drive-related components
│   │   ├── breadcrumb.tsx        # Folder navigation breadcrumb
│   │   ├── context-menu.tsx      # Right-click context menu
│   │   ├── create-file-dialog.tsx
│   │   ├── delete-confirm-dialog.tsx
│   │   ├── drive-page.tsx        # Main drive page component
│   │   ├── file-grid.tsx         # File grid view
│   │   ├── file-info-dialog.tsx
│   │   ├── file-upload.tsx       # File upload component
│   │   ├── file-viewer.tsx       # File preview/viewer
│   │   ├── filter-bar.tsx        # Search and filter bar
│   │   ├── header.tsx            # Top header
│   │   ├── rename-dialog.tsx
│   │   ├── share-dialog.tsx      # File sharing dialog
│   │   └── sidebar.tsx           # Sidebar navigation
│   ├── protected-route.tsx       # Route protection wrapper
│   └── ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── google-icon.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── tabs.tsx
│       └── toast.tsx
│
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client functions
│   ├── auth-context.tsx          # Authentication context
│   ├── constants/                # App constants
│   │   └── index.ts
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── auth.ts               # Auth utilities
│   │   └── file.ts               # File utilities
│   └── utils.ts                  # General utilities
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Project dependencies
├── pnpm-lock.yaml               # pnpm lock file
├── pnpm-workspace.yaml          # pnpm workspace config
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 🔌 API Integration

This frontend application communicates with a backend API. The API client is configured in `lib/api.ts`.

### Required API Endpoints

The backend should implement the following endpoints:

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/google/callback` - Google OAuth callback

#### File Operations
- `GET /api/files` - List files (with query params: `limit`, `offset`, `parent_id`)
- `GET /api/files/search?q=term` - Search files
- `POST /api/files/upload` - Upload file
- `POST /api/files/folder` - Create folder
- `GET /api/files/:id` - Get file info
- `PATCH /api/files/:id/rename` - Rename file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file

#### Sharing
- `POST /api/files/:id/share` - Share file with user
- `GET /api/files/:id/share` - Get share information
- `POST /api/files/:id/share-link` - Create shareable link
- `DELETE /api/files/:id/share-link` - Remove share link
- `DELETE /api/files/:id/share/:userId` - Revoke share access
- `GET /api/files/shared` - Get shared files
- `GET /api/files/shared/:token` - Get shared file by token
- `GET /api/files/shared/:token/download` - Download shared file

### API Response Format

The API should return responses in the following format:

```typescript
{
  success: boolean;
  message?: string;
  data: {
    // Response data
  };
}
```

### Authentication

The frontend uses Bearer token authentication. The token is stored in `localStorage` and sent in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server on `http://localhost:3000` |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint to check for code issues |

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **API Connection Errors**

**Problem**: Cannot connect to backend API

**Solution**:
- Ensure your backend API server is running
- Check that `NEXT_PUBLIC_API_URL` in `.env.local` is correct
- Verify CORS settings on your backend allow requests from `http://localhost:3000`

#### 2. **Authentication Not Working**

**Problem**: Login/signup fails or redirects don't work

**Solution**:
- Check that the backend API is running and accessible
- Verify API endpoints match the expected format
- Check browser console for error messages
- Ensure token is being stored in `localStorage`

#### 3. **Google OAuth Not Working**

**Problem**: Google sign-in button doesn't work

**Solution**:
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Check that redirect URI is configured in Google Cloud Console
- Ensure OAuth callback route is properly set up

#### 4. **File Upload Fails**

**Problem**: Files cannot be uploaded

**Solution**:
- Check backend API is running
- Verify file size limits (default 15GB)
- Check network tab in browser DevTools for error messages
- Ensure backend accepts multipart/form-data

#### 5. **Build Errors**

**Problem**: `pnpm build` fails

**Solution**:
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Check TypeScript errors: `pnpm lint`
- Ensure all environment variables are set

#### 6. **Port Already in Use**

**Problem**: Port 3000 is already in use

**Solution**:
- Kill the process using port 3000
- Or change the port: `pnpm dev -- -p 3001`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and test thoroughly
4. **Commit your changes**:
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to the branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add comments for complex logic
- Maintain consistent code formatting

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icon library

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the code documentation
3. Check browser console for error messages
4. Verify backend API is running and accessible

---

**Made with ❤️ using Next.js and React**
