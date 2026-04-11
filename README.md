# Ireland Go Dashboard 🚗🇮🇪

A modern, feature-rich admin dashboard for managing Ireland Go's transportation services, including private transfers, day trips, multi-day tours, and transfer routes across Ireland.

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3.6-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.23.4-0170FE?logo=ant-design)

## 🌟 Features

### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- Interactive charts and graphs
- Performance monitoring

### 🚐 Fleet Management
- **Vehicles**: Complete CRUD operations for fleet management
- Vehicle details, status tracking, and maintenance records
- Action buttons for view, edit, and delete operations

### 📅 Booking Management
- **Bookings**: View and manage all customer bookings
- Booking details with customer information
- Status tracking and updates

### 💰 Financial Management
- **Earnings**: Track revenue and transactions
- Detailed transaction history
- Financial analytics and reporting

### ⭐ Customer Engagement
- **Reviews**: Manage customer reviews and ratings
- Star rating system
- Review moderation and responses

### 📝 Content Management
Comprehensive content management system with four main sections:

#### 1. **Private Transfers**
- Manage point-to-point transfer routes
- Location-based filtering (dropdown select)
- From/To location dropdowns (18 Irish cities)
- Distance, pricing, and descriptions
- Image upload with preview

#### 2. **Popular Day Trips**
- Curated day trip packages
- Duration and group type management
- Pricing per person
- Image gallery support

#### 3. **Popular Multi-Day Tours**
- Extended tour packages
- Multi-day itinerary management
- Comprehensive tour details
- Image upload functionality

#### 4. **Day Trips**
- Location-based filtering (All, Dublin, Belfast, Cork, Limerick, Galway)
- Departure city selection
- Full CRUD operations with modals
- Image upload with preview

#### 5. **Popular Transfer Routes**
- Popular routes from major cities
- Location filtering dropdown
- Route descriptions and highlights
- Distance/time information

### 👥 User & Admin Management
- **User Details**: View and manage customer accounts
- **Create Admin**: Admin account creation and management
- Role-based access control

### 📢 Communication
- **Notifications**: System-wide notification management
- Real-time alerts and updates

### ❓ Support & Information
- **FAQ**: Frequently asked questions management
- Add, edit, and delete FAQ items
- Categorized help content

### ⚙️ Settings & Configuration
- **Settings**: System configuration
- **Profile Management**: Admin profile updates
- **Change Password**: Secure password management
- **Privacy Policy**: Policy management
- **Terms & Conditions**: Terms management
- **About Us**: Company information

### 📊 Reporting
- **Reports**: Generate and view system reports
- Status filtering (All, Pending, Resolved, Rejected)
- Edit report status functionality

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.3.1** - Modern UI library
- **Vite 6.3.6** - Fast build tool and dev server

### Styling
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Ant Design 5.23.4** - Enterprise-level UI components
- Custom gradient themes and modern design patterns

### Routing
- **React Router DOM 7.1.1** - Client-side routing

### Icons
- **React Icons 5.4.0** - Comprehensive icon library
  - Feather Icons (Fi)
  - Ionicons (Io)
  - Font Awesome (Fa)
  - Material Design (Md)

### Form Handling
- **React Hook Form 7.54.2** - Performant form validation

## 📁 Project Structure

```
ireland-go-dashboard/
├── src/
│   ├── layout/
│   │   └── MainLayout.jsx          # Main application layout
│   ├── pages/
│   │   ├── auth/                   # Authentication pages
│   │   ├── dashboard/              # Dashboard home
│   │   ├── Bookings/               # Booking management
│   │   ├── Earnings/               # Financial tracking
│   │   ├── Vehicles/               # Fleet management
│   │   ├── Reviews/                # Review management
│   │   ├── Content/                # Content management
│   │   │   ├── Content.jsx         # Content hub
│   │   │   ├── PrivateTransfers.jsx
│   │   │   ├── PopularDayTrips.jsx
│   │   │   ├── PopularMultiDayTours.jsx
│   │   │   ├── DayTrips.jsx
│   │   │   └── PopularTransferRoutes.jsx
│   │   ├── FAQ/                    # FAQ management
│   │   ├── Reports/                # Reporting system
│   │   ├── Settings/               # Settings & config
│   │   └── profile/                # Profile management
│   ├── shared/
│   │   ├── Sidebar/                # Navigation sidebar
│   │   └── MainHeader/             # Header component
│   ├── routes/
│   │   └── Routes.jsx              # Route configuration
│   └── App.jsx                     # Root component
├── public/                         # Static assets
└── package.json                    # Dependencies
```

## 🎨 Design Features

### Modern UI/UX
- **Gradient Headers**: Beautiful blue-to-indigo gradients
- **Glassmorphism**: Frosted glass effects on cards
- **Smooth Animations**: Transition effects throughout
- **Responsive Design**: Mobile-first approach
- **Color-Coded Status**: Visual status indicators

### Component Patterns
- **Ant Design Tables**: Customized with blue headers
- **Modal System**: Consistent modal designs for CRUD operations
- **Image Upload**: File upload with live preview
- **Dropdown Filters**: Location-based filtering
- **Action Buttons**: View (blue), Edit (green), Delete (red)

### Irish Cities Supported
Dublin, Galway, Cork, Belfast, Limerick, Killarney, Waterford, Derry, Sligo, Kilkenny, Wexford, Tralee, Ennis, Drogheda, Dundalk, Bray, Navan, Athlone

## 🔐 Authentication

- Sign In page with form validation
- Forgot Password flow
- Verification Code system
- Reset Password functionality

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 📝 License

This project is private and proprietary.


**Built with ❤️ for Ireland Go** 🚗🇮🇪
