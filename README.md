# Victory Fitness Admin Dashboard

A modern, high-fidelity admin dashboard designed to manage the Victory Fitness ecosystem. This platform empowers administrators to seamlessly handle user management, video workout libraries, premium subscription tiers, fitness challenges, and comprehensive platform settings.

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0.3-38B2AC?logo=tailwind-css)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.23.4-0170FE?logo=ant-design)

## Features

### Dashboard & Analytics

- Real-time performance metrics and key performance indicators (KPIs).
- Interactive charts visualizing user growth and platform engagement (powered by Recharts and Chart.js).
- Recent active users and quick-access administration panel.

### User & Subscriber Management

- **All Users**: Comprehensive data grid of all registered users with fully featured CRUD capabilities.
- **All Subscribers**: Dedicated tracking capabilities for users with active premium subscriptions, categorizing them by tier (Silver, Gold, Platinum, Inner Circle).
- **User Details**: Advanced modal-based view components for deep dives into specific user accounts, demographics, and contact information.

### Workouts Library

- Integrated centralized hub for managing the platform's intensive video workout catalog.
- Support for Vimeo video IDs and thumbnail synchronization.
- Categorization across varying modalities (Strength, Cardio, Core, Yoga).
- Status toggles for Draft vs. Published visibility controls.

### Challenges

- Create, manage, and track community fitness challenges (e.g., 30-Day Shred, Couch to 5K).
- Track duration, difficulty levels, and current rollout statuses (Active, Upcoming, Draft).
- Beautiful horizontal card-based structural UI.

### Subscriptions & Plans

- Manage access tiers including Victory Silver, Gold, Platinum, and Inner Circle.
- Manage pricing structures (Monthly/Yearly) and associated tier feature lists.
- Dynamically highlight "Most Popular" or "Application Only" plans.

### Content & Platform Settings

- **Rich Text Editing**: Integrated `React Quill` for dynamic editing of critical platform text pages.
- **About Us**: Author and modify the company mission and overview framework.
- **Privacy Policy & Terms**: Keep strict legal documents up-to-date directly from the interface.
- **FAQ Management**: Create and organize commonly asked questions for the user support hub.
- **Notifications System**: Global alerts mapping system updates, new registrations, and payment events.
- **Reporting & Exports**: Incorporates `jspdf` and `html2pdf.js` for secure document exportation.
- **Admin Profile**: Custom settings for updating basic information, credentials, and profile images.

## Tech Stack

### Frontend Architecture

- **React 18.3.1** - Component-based modern UI library.
- **Vite 6** - Lightning-fast build tool and local development server.

### Styling & UI Components

- **TailwindCSS 4** - Utility-first CSS framework enforcing a consistent, premium "Zen Dark" and vibrant blue/indigo gradient aesthetic.
- **Ant Design 5** - Robust enterprise-level UI components tailored for data-heavy sections like user tables, pagination, and modals.
- **React Icons** - Comprehensive iconography utilizing `Fa`, `Md`, `Io5`, and `Lu`.

### Data & Utility Integration

- **React Router DOM 7** - Seamless client-side routing with nested layout hierarchy.
- **React Quill** - Powerful rich text content editor.
- **Recharts & Chart.js** - Responsive and declarative charting libraries for the core dashboard.
- **Day.js** - Lightweight library for advanced localized date formatting.
- **JWT Decode** - Secure token parsing and state authentication checks.

## Project Structure

```
victory-fitness-dashboard/
├── src/
│   ├── layout/                   # Main application structural layout container
│   ├── pages/                    # Core modular route pages
│   │   ├── auth/                 # Secure Sign-in, Reset Password flows
│   │   ├── dashboard/            # Platform KPIs and Analytics Charts
│   │   ├── userDetails/          # Primary user management & detailed views
│   │   ├── Subscribers/          # Dedicated premium subscriber tracking
│   │   ├── Workouts/             # Video workout library ecosystem
│   │   ├── Challenges/           # Gamified fitness challenges
│   │   ├── Subscriptions/        # Pricing & Tier definitions
│   │   ├── Masterclasses/        # Premium educational content
│   │   ├── Community/            # Social interaction and reporting
│   │   ├── FAQ/                  # Support questions and answers
│   │   ├── Notifications/        # System alerting mechanism
│   │   ├── Settings/             # Hub for textual platform pages
│   │   ├── About Us/             # Rich Text integration - About Us
│   │   ├── Privacy Policy/       # Rich Text integration - Privacy
│   │   ├── Terms Condition/      # Rich Text integration - Terms
│   │   └── profile/              # Secure Admin profiles management
│   ├── shared/                   # Reusable components (MainHeader, Sidebar)
│   ├── utils/                    # Global helper scripts and demoData.js
│   ├── routes/                   # Complex routing definitions
│   └── App.jsx                   # Application entry sequence
├── public/                       # Image assets and static files
└── package.json                  # Dependencies and core project scripts
```

## Design Philosophy

The Victory Fitness Admin Panel prioritizes a premium, high-impact aesthetic. It seamlessly blends modern glassmorphism features, vibrant blue/indigo gradients, and accessible high-contrast typography. Detailed interactive feedback, integrated via robust hover states and transition animations, ensures administrative tasks feel engaging and efficient. The layout natively scales, catering equally to desktop power configurations and mobile on-the-go management.

## License

This project is private and proprietary to Victory Fitness.
