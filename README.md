# EasyRent – Equipment Rental Platform

EasyRent is a modern equipment rental marketplace that connects equipment owners with customers. Customers can easily explore, search, and rent equipment for specific periods, while equipment owners can list their equipment, manage rental bookings, and track their business performance.

The platform provides a secure and user-friendly rental experience with role-based dashboards, equipment management, booking management, and online payment integration.

## 🌐 Live Website

[https://easy-rent-ivory.vercel.app](https://easy-rent-ivory.vercel.app)

## ✨ Key Features

- **User Authentication:** Register and log in using email/password or Google authentication.
- **JWT Authentication:** Secure API communication with JWT token verification.
- **Role-Based Access Control:** Separate permissions for Customers, Owners, and Admins.
- **Equipment Management:** Owners can add, update, delete, and manage their equipment.
- **Equipment Browsing:** Explore approved equipment with detailed information.
- **Search & Filtering:** Search equipment by name or location and filter by category, rental type, price, and availability.
- **Equipment Details:** View equipment descriptions, images, rental prices, availability, and owner information.
- **Rental Booking:** Book equipment by selecting rental dates, quantity, and providing delivery information.
- **Stripe Payment:** Secure online payments through Stripe Checkout.
- **Payment Records:** Store transaction information and payment status.
- **Favorites:** Customers can add and remove their favorite equipment.
- **Customer Dashboard:** Manage rentals, favorites, and profile information.
- **Owner Dashboard:** Manage equipment, rental requests, and business performance.
- **Admin Dashboard:** Manage users, approve or reject equipment, and monitor rental activities.
- **Dashboard Analytics:** Display important statistics and rental performance.
- **Profile Management:** Users can view and update their profile information.
- **Responsive Design:** Optimized for mobile, tablet, and desktop devices.
- **Loading & Error Pages:** User-friendly loading and error experiences.
- **Theme Toggle:** Support for light and dark mode.

## 🛠️ Technologies Used

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Authentication & Authorization
- Better Auth
- MongoDB Adapter
- JWT
- Role-Based Access Control (RBAC)

### Backend
- Node.js
- Express.js
- MongoDB
- JavaScript

### Payment Integration
- Stripe

### Image Hosting
- ImgBB

### Deployment
- Vercel

## 📦 NPM Packages Used

### Client Side

| Package | Purpose |
|---|---|
| `next` | React framework for the frontend |
| `react` | Building user interfaces |
| `react-dom` | Rendering React components |
| `typescript` | Type safety |
| `better-auth` | Authentication and session management |
| `motion` | Animations and transitions |
| `tailwindcss` | Styling and responsive layouts |

### Server Side

| Package | Purpose |
|---|---|
| `express` | Backend API development |
| `mongodb` | MongoDB database operations |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment configuration |
| `stripe` | Payment gateway integration |

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| Customer | Browse equipment, manage favorites, book rentals, and make payments |
| Owner | Add and manage equipment, handle rental requests, and track earnings |
| Admin | Manage users, approve or reject equipment, and monitor platform activities |

## 🔐 Security Features

- JWT token verification.
- Role-based authorization middleware.
- Protected frontend routes.
- Protected backend API endpoints.
- Secure authentication and session management.
- Server-side authorization for sensitive operations.
- Secure Stripe payment processing.

## 📂 Project Repositories

- **Client Repository:** Add your client GitHub repository URL.
- **Server Repository:** Add your server GitHub repository URL.

## 🎯 Project Purpose

The main purpose of EasyRent is to make equipment rental easier, faster, and more accessible. It provides a centralized marketplace where customers can find and rent suitable equipment while equipment owners can manage their rental businesses efficiently.

EasyRent aims to create a transparent and reliable rental experience through secure authentication, efficient booking management, and online payment integration.
