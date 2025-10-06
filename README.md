# Employee Management System

A modern web application for managing employees, departments, and user roles built with React and TypeScript.

## Why This Project Stands Out

- **Comprehensive Role-Based Access Control:** Supports Admin, Manager, and Employee roles with fine-grained permissions, ensuring secure and efficient management.
- **Intuitive User Interface:** Built with shadcn/ui components and Tailwind CSS for a sleek, responsive, and user-friendly experience.
- **Real-Time Data Management:** Utilizes Supabase backend with React Query for seamless data fetching and state management.
- **Scalable Architecture:** Modular design with reusable components and hooks, making it easy to extend and maintain.
- **Hackathon Ready:** Focused on delivering a polished, production-ready app with essential features and excellent UX, making it a strong contender in competitive environments.

## Features

- User authentication and role-based access control (Admin, Manager, Employee)
- Employee management with detailed profiles
- Department management
- Dashboard with overview statistics
- Responsive design with Tailwind CSS

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **State Management**: React Query
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── integrations/        # External service integrations
└── types/               # TypeScript type definitions
```

## Deployment

This project can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

For production builds:
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
