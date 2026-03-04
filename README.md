# Academia Connect - Comprehensive School Management System

A full-stack, enterprise-grade school management system built with Next.js 14, TypeScript, and Supabase. This platform provides a complete digital solution for educational institutions to manage students, teachers, classes, attendance, assignments, exams, and communication.

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: Supabase Auth (with role-based access control)
- **Styling**: TailwindCSS with custom theming and dark mode
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts
- **Calendar**: React Big Calendar
- **Notifications**: React Toastify
- **File Upload**: Cloudinary integration

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│(Server Actions) │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Supabase Auth  │    │   Prisma ORM    │    │   File Storage  │
│   (RBAC)        │    │   (Type-safe)   │    │   (Cloudinary)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Database Schema & Data Models

### Core Entities

#### User Management

- **Admin**: System administrators with full access
- **Teacher**: Educators managing classes and assignments
- **Student**: Learners with academic tracking
- **Parent**: Guardians with student monitoring access

#### Academic Structure

- **Grade**: Academic levels (1-12)
- **Class**: Specific classroom groups within grades
- **Subject**: Academic disciplines (Math, Science, etc.)
- **Lesson**: Scheduled class sessions

## 🔐 Authentication & Authorization System

### Supabase Integration

- **Secure Authentication**: Email/Password based authentication
- **Role-based Access Control**: Admin, Teacher, Student, Parent
- **User Metadata**: Extended user profiles with role information stored in Supabase Auth metadata.

## 📊 Features & Functionality

### 1. User Management System

- Complete student, teacher, and parent records.
- Automated role assignment on creation.

### 2. Academic Management

- Class, subject, and lesson scheduling.
- Conflict-free time slot management.
- Comprehensive assignment and exam systems.

### 3. Attendance Management

- Real-time per-lesson attendance tracking.
- Automated reporting and analytics.

### 4. Communication System

- Targeted announcements (class-specific or school-wide).
- Internal messaging system with threading support.
- Fully interactive school event calendar.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase Account
- Cloudinary Account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```env
   DATABASE_URL="your_supabase_db_url"
   DIRECT_URL="your_supabase_direct_url"
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   ```
4. Push database schema:
   ```bash
   npx prisma db push
   ```
5. Run development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.

---

**Academia Connect** - Empowering educational institutions with modern technology solutions.
