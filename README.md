# 🏥 DoctorConnect

A healthcare management platform for managing patients, appointments, prescriptions, and virtual consultations.

## Prerequisites

- Node.js 18+
- pnpm 8+

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

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/DarshanKasundra12/DoctorConnect.git
cd DoctorConnect
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
pnpm dev
```

Visit `http://localhost:5173` in your browser.

## License

Copyright © 2025 DoctorConnect. All rights reserved.
