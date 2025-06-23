# Inventory Management System

## Overview

This is a full-stack inventory management application built with React, Express, and PostgreSQL. The system provides comprehensive inventory tracking, user management, supplier/customer relationship management, and order processing capabilities. It features a modern, responsive UI built with shadcn/ui components and uses Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Custom component library based on Radix UI primitives and shadcn/ui
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Pattern**: RESTful API endpoints
- **Session Management**: Express sessions with PostgreSQL storage
- **Build System**: ESBuild for production bundling

### Database Design
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Database Schema
The system includes the following main entities:
- **Users**: System users with role-based access (admin, manager, staff)
- **Products**: Inventory items with SKU, pricing, and stock tracking
- **Categories**: Product categorization system
- **Suppliers**: Vendor management with contact information
- **Customers**: Customer relationship management
- **Inventory Transactions**: Stock movement tracking (in/out/adjustment)
- **Purchase Orders**: Procurement management with line items
- **Sales Orders**: Sales transaction management with line items

### Frontend Pages
- **Dashboard**: Overview with stats, charts, and quick actions
- **Products**: Product catalog management
- **Inventory**: Stock level monitoring and transaction history
- **Suppliers**: Vendor relationship management
- **Customers**: Customer information management
- **Orders**: Purchase and sales order processing
- **Reports**: Business intelligence and reporting
- **Users**: User account and role management

### API Endpoints
The system provides RESTful endpoints for:
- Dashboard statistics and metrics
- CRUD operations for all major entities
- Inventory transaction processing
- Order management workflows
- User authentication and authorization

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests and validate data using Zod schemas
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: Data flows back through the API to update React Query cache
5. **UI Updates**: Components re-render based on cached data changes

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm** & **@neondatabase/serverless**: Database ORM and connection
- **wouter**: Lightweight client-side routing
- **react-hook-form** & **@hookform/resolvers**: Form handling and validation
- **zod**: Runtime type validation and schema definition

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code
- **drizzle-kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit environment
- **Database**: PostgreSQL 16 provided by Replit
- **Dev Server**: Vite dev server with HMR at port 5000
- **Process Management**: npm scripts for development workflow

### Production Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle Kit pushes schema changes
4. **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **Database**: Uses `DATABASE_URL` environment variable
- **Sessions**: PostgreSQL-backed session storage
- **CORS**: Configured for cross-origin requests
- **Error Handling**: Centralized error middleware

## Changelog

```
Changelog:
- June 21, 2025. Enhanced order management system with comprehensive forms:
  - Updated purchase and sales order schemas with detailed financial fields
  - Added support for line-item tax/discount calculations 
  - Implemented enhanced order forms with dynamic product tables
  - Added real-time financial totals calculation
  - Integrated PDF export functionality for both order types
  - Enhanced payment terms and delivery tracking fields
- June 21, 2025. Migration to Replit environment completed
- June 21, 2025. Starting comprehensive feature expansion:
  - Core Pages: Returns, Payments, Notifications, Settings
  - Advanced inventory features with multi-location and batch tracking
  - Enhanced order management with workflows and invoicing
  - Reporting and analytics module
  - UX improvements and mobile optimization
- June 20, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```