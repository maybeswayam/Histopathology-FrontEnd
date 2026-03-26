# HistoAI - Cancer Detection System

HistoAI is an AI-powered histopathology cancer detection system that helps medical professionals analyze microscopic images for cancer detection using Google's Gemini AI.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [AI Integration](#ai-integration)
- [Components](#components)
- [Development Commands](#development-commands)
- [Deployment](#deployment)

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Framework**: 
  - Tailwind CSS for styling
  - shadcn/ui components (based on Radix UI)
- **State Management**: React Hooks
- **Authentication**: Supabase Auth
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React

### AI & Backend Integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Client-side processing with base64 encoding

## Features

- 🔐 **Authentication System** - Secure signup/login with Supabase
- 🖼️ **Image Upload & Analysis** - Drag-and-drop histopathology image analysis
- 🤖 **AI-Powered Detection** - Google Gemini Pro Vision for cancer detection
- 📊 **Results Dashboard** - View analysis history and detailed results
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 📈 **Analysis History** - Track and review previous analyses
- 🔍 **Detailed Explanations** - AI provides reasoning for its predictions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** (recommended package manager)
- **Git** (for version control)

You'll also need accounts for:
- **Supabase** (for authentication and database)
- **Google AI Studio** (for Gemini API access)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd histopathology-ai
```

### 2. Install Dependencies
```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
# You'll need:
# - Supabase URL and anon key
# - Google Gemini API key
```

### 4. Configure Your Services

#### Supabase Setup:
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Run the SQL script in `scripts/001_create_tables.sql` in your Supabase SQL editor

#### Google Gemini API Setup:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `NEXT_PUBLIC_GEMINI_API_KEY`

### 5. Start the Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/                   # Next.js 14 app directory
│   ├── analyze/          # Image analysis page
│   ├── auth/             # Authentication pages (login, signup)
│   ├── dashboard/        # User dashboard with analysis history
│   ├── landing/          # Landing page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page
├── components/           
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── landing/         # Landing page specific components
│   ├── image-upload.tsx # Image upload component
│   ├── results-display.tsx # Results display component
│   └── theme-provider.tsx # Theme context provider
├── lib/
│   ├── supabase/        # Supabase client configuration
│   └── utils.ts         # Utility functions
├── services/
│   └── api.ts           # Google Gemini API integration
├── hooks/               # Custom React hooks
├── public/              # Static assets
├── scripts/             # Database setup scripts
└── styles/              # Additional styles
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Authentication Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Google Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
```

### Next.js Configuration
The project uses Next.js 14 with the following configuration (`next.config.mjs`):
- TypeScript build errors are ignored in production
- Image optimization is disabled for compatibility

### TypeScript Configuration
- Strict mode enabled
- ES6 target
- Path aliases configured for clean imports (`@/` prefix)

### Tailwind Configuration
- Custom theme using shadcn/ui
- New York style variant
- CSS variables for theming
- Dark/light mode support

## Authentication

The application uses Supabase Authentication with the following features:
- **Email/Password authentication** - Secure user registration and login
- **Protected routes** - Middleware-based route protection
- **Session management** - Automatic session handling and refresh
- **Authentication middleware** - Server-side session validation
- **Redirect handling** - Smart redirects for authenticated/unauthenticated users

## AI Integration

The application integrates with Google's Gemini Pro Vision AI model:
- **Model**: Gemini Pro Vision for image analysis
- **Processing**: Client-side image conversion to base64
- **Analysis**: Advanced histopathology pattern recognition
- **Results**: Structured JSON responses with confidence scores
- **Error handling**: Graceful fallbacks and detailed error messages
- **Performance**: Processing time tracking and optimization

### AI Analysis Features:
- Cancer detection in histopathology images
- Confidence scoring (0-1 scale)
- Detailed explanations of findings
- Cellular pattern analysis
- Tissue organization assessment

## Components

### UI Components
- **shadcn/ui library** - Comprehensive set of accessible components
- **Radix UI primitives** - Unstyled, accessible component foundation
- **Tailwind CSS styling** - Utility-first CSS framework
- **Dark/light theme support** - Seamless theme switching
- **Responsive design** - Mobile-first approach

### Custom Components
- **ImageUpload** - Drag-and-drop image upload with validation
- **ResultsDisplay** - Analysis results with confidence indicators
- **Landing page components** - Hero, Features, CTA sections
- **Navigation components** - Responsive navigation and layout

## Development Commands

### Frontend Commands
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Database Commands
```bash
# Set up Supabase tables (run in Supabase SQL editor)
# File: scripts/001_create_tables.sql
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Add your Supabase and Gemini API credentials
```

## Deployment

### Vercel Deployment (Recommended)
1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Environment Variables**
   - Add all environment variables from `.env.example`
   - Ensure all API keys and URLs are correctly set

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`

### Manual Deployment
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Common Issues

**1. Gemini API Key Issues**
- Ensure your API key is valid and has proper permissions
- Check the Google AI Studio console for usage limits
- Verify the key is correctly set in environment variables

**2. Supabase Connection Issues**
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure the database tables are created using the provided SQL script

**3. Image Upload Issues**
- Check file size limits (recommended < 10MB)
- Ensure supported image formats (JPEG, PNG, WebP)
- Verify network connectivity for API calls

**4. Build Issues**
- Clear `.next` directory and rebuild
- Check for TypeScript errors
- Ensure all dependencies are installed

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_API_URL` | Frontend URL (for redirects) | `http://localhost:3000` |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Auth redirect URL | `http://localhost:3000/dashboard` |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | `AIzaSyAKZn6r9QW-yTxI...` |

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes following the project conventions
4. Test your changes thoroughly
5. Submit a pull request with a clear description

## Development Workflow Summary

### Initial Setup
```bash
# 1. Clone and navigate to project
git clone <repository-url>
cd histopathology-ai

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
pnpm dev
```

### Daily Development
```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for testing
pnpm build
```

### Key URLs
- **Frontend**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Google AI Studio**: https://makersuite.google.com/app/apikey

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase       │    │  Google Gemini  │
│   (Frontend)    │◄──►│   (Auth + DB)    │    │   (AI Analysis) │
│                 │    │                  │    │                 │
│ • React UI      │    │ • Authentication │    │ • Image Analysis│
│ • Image Upload  │    │ • User Data      │    │ • Cancer Detection│
│ • Results View  │    │ • History Storage│    │ • Confidence Score│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## License

This project is proprietary and confidential.