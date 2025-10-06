# 🎮 IMAGI - Game Gallery Platform

A modern, interactive web platform for gamers to upload, share, and vote on gaming screenshots with advanced filtering, admin management, and beautiful UI animations.

![IMAGI Preview](https://via.placeholder.com/800x400/1a1a2a/ffffff?text=IMAGI+Game+Gallery)

## ✨ Features

### 🎯 Core Functionality
- **Image Upload & Management**: Secure image uploads to Cloudinary with Firebase storage
- **Advanced Gallery**: Responsive grid layout with infinite scroll and load more functionality
- **Smart Filtering**: Filter images by game and genre with dynamic dropdowns
- **Interactive Voting**: Like/dislike system with user authentication and vote tracking
- **Image Cropping & Download**: Real-time image cropping for different resolutions (Desktop, Mobile, Tablet, Square)

### 🎨 User Interface
- **Modern Design**: Glassmorphism effects with backdrop blur and gradient overlays
- **Smooth Animations**: Framer Motion powered animations and transitions
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark Theme**: Consistent dark theme optimized for gaming aesthetics

### 🔐 Authentication & Security
- **Firebase Auth**: Secure user authentication with email/password
- **Vote Protection**: One vote per user per image with duplicate prevention
- **Admin Panel**: Comprehensive admin dashboard for content management

### 📊 Admin Features
- **Dashboard**: Real-time statistics (total images, likes, users)
- **Content Management**: Add, edit, delete images with metadata
- **Configuration**: Dynamic genre and game management
- **User Management**: View active users and voting patterns

### 🛠️ Technical Features
- **Real-time Updates**: Live voting and content updates
- **Image Optimization**: Automatic image compression and format optimization
- **SEO Friendly**: Server-side rendering with Next.js
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized loading with lazy loading and caching

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend & Database
- **Firebase** - Authentication, Firestore database, hosting
- **Cloudinary** - Image storage and optimization

### UI Components
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful component library

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Next.js API Routes** - Serverless functions