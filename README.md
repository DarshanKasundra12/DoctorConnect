# 🏥 DoctorConnect

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

A modern, feature-rich healthcare management platform built for the digital age. DoctorConnect streamlines medical practice operations with an intuitive interface for managing patients, appointments, prescriptions, and virtual consultations.

## ✨ Key Features

### For Healthcare Providers
- 🏥 **Smart Patient Management**
  - Comprehensive patient profiles
  - Medical history tracking
  - Document management
  - Custom note templates

- 📅 **Advanced Appointment System**
  - Real-time scheduling
  - Automated reminders
  - Calendar integrations
  - Recurring appointments
  - Waitlist management

- 📝 **Digital Prescriptions**
  - Electronic prescription generation
  - Medicine database integration
  - Dosage tracking
  - Prescription history
  - Digital signature support

- 🎥 **Integrated Teleconsultation**
  - HD video consultations
  - Screen sharing
  - Chat functionality
  - Recording capabilities
  - Virtual waiting room

### Practice Management
- 💰 **Smart Billing & Invoicing**
  - Automated invoice generation
  - Payment tracking
  - Insurance processing
  - Financial reporting
  - Multiple payment methods

- 📊 **Analytics Dashboard**
  - Practice insights
  - Patient demographics
  - Revenue analytics
  - Appointment statistics
  - Custom reports

## Getting Started

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## 🛠️ Technology Stack

### Frontend
- ⚛️ **React 18** - Modern UI development
- 🔷 **TypeScript 5.0** - Type-safe development
- ⚡ **Vite** - Next-gen frontend tooling
- 🎨 **shadcn/ui** - Pre-built accessible components
- 💨 **Tailwind CSS** - Utility-first styling
- 📱 **Responsive Design** - Mobile-first approach

### Backend & Database
- 🔥 **Supabase**
  - Real-time database
  - Authentication
  - Storage
  - Serverless Functions
  - Row Level Security
- 🔒 **End-to-end encryption** for sensitive data
- 🌐 **RESTful APIs** with TypeScript types

### DevOps & Tools
- 📦 **pnpm** - Fast, disk space efficient package manager
- 🧪 **Vitest** - Unit testing
- 📝 **ESLint** - Code quality
- 💅 **Prettier** - Code formatting
- 🔄 **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+ 
- Supabase CLI
- Git

### Installation Steps

1. Clone and setup:
```bash
# Clone the repository
git clone https://github.com/DarshanKasundra12/DoctorConnect.git
cd DoctorConnect

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
```

2. Configure Supabase:
```bash
# Initialize Supabase
supabase init

# Start local Supabase
supabase start
```

3. Run development server:
```bash
# Start the application
pnpm dev
```

Visit `http://localhost:5173` to see your application running.

## 📁 Project Structure

```
DoctorConnect/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── billing/      # Billing & invoice components
│   │   ├── layout/       # Layout components
│   │   ├── patients/     # Patient management
│   │   ├── prescriptions/# Prescription components
│   │   └── ui/          # Base UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Application routes
│   └── types/           # TypeScript definitions
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
└── public/             # Static assets
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style

- Follow the TypeScript style guide
- Write meaningful commit messages
- Add appropriate documentation
- Include tests for new features

## 📝 License

Copyright © 2025 DoctorConnect. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.
