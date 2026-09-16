# KEYSTONE – Field Service Management Platform

KEYSTONE is a full-stack **Field Service Management Platform** designed to streamline service operations between managers, dispatchers, technicians, and customers.

The platform provides role-based access to manage users, customers, sites, service requests, work orders, technician assignments, inventory, notifications, and field-service workflows through a modern web application.

---

## 📌 Project Overview

KEYSTONE provides a centralized platform for managing field-service operations from service request creation to work-order completion.

The system supports four dedicated roles:

- **Manager**
- **Dispatcher**
- **Technician**
- **Customer**

Each role has controlled access to the features required for its responsibilities through JWT-based authentication and role-based authorization.

---

## ✨ Key Features

### 🔐 Authentication & Security

- User login with JWT authentication
- Role-based authorization
- BCrypt password hashing
- Protected REST APIs
- Active/inactive user control
- Secure token-based frontend API communication

### 👨‍💼 Manager

Managers can:

- Access the management dashboard
- View platform users
- Create new users
- Create Manager, Dispatcher, and Technician accounts
- Manage operational information
- Monitor overall field-service activity

### 📋 Dispatcher

Dispatchers can:

- Access the dispatcher dashboard
- View customers and sites
- View service requests
- Create work orders
- Assign technicians to work orders
- Monitor technician availability/workload
- Track work-order status
- View inventory information
- Manage operational activities

### 🔧 Technician

Technicians can:

- View assigned work orders
- Start assigned jobs
- Update work-order status
- Complete assigned jobs
- View job-related information
- Receive notifications
- Access their profile

### 👤 Customer

Customers can:

- Register and log in
- Access the customer dashboard
- Manage their profile
- View/manage sites
- Create service requests
- Track service requests
- Track work orders
- Receive notifications
- Access profile information

---

## 🔄 Work Order Lifecycle

KEYSTONE supports the following work-order workflow:

```text
NEW
 │
 ▼
ASSIGNED
 │
 ▼
IN_PROGRESS
 │
 ▼
COMPLETED
```

The backend validates status transitions to prevent invalid workflow changes.

---

## 🏗️ Technology Stack

### Backend

| Technology      | Version / Usage               |
| --------------- | ----------------------------- |
| Java            | 21                            |
| Spring Boot     | 3.5.5                         |
| Spring Security | JWT + RBAC                    |
| Spring Data JPA | Database access               |
| Hibernate       | ORM                           |
| Maven           | Build & dependency management |
| MySQL           | 8.x                           |
| Flyway          | Database migrations           |

### Frontend

| Technology | Usage                          |
| ---------- | ------------------------------ |
| React      | UI development                 |
| TypeScript | Type-safe frontend development |
| Vite       | Frontend build tool            |
| CSS        | Responsive UI styling          |
| REST API   | Backend communication          |
| JWT        | Authentication                 |

---

## 🧩 System Architecture

```text
┌──────────────────────────────────────────────┐
│                 KEYSTONE UI                  │
│          React + TypeScript + Vite           │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API
                       │ JWT Bearer Token
                       ▼
┌──────────────────────────────────────────────┐
│              Spring Boot Backend             │
│                                              │
│ Controllers                                  │
│ Services                                     │
│ Repositories                                 │
│ Security / JWT                               │
│ DTOs                                         │
└──────────────────────┬───────────────────────┘
                       │
                       │ JPA / Hibernate
                       ▼
┌──────────────────────────────────────────────┐
│                  MySQL 8                     │
│                                              │
│ Users                                        │
│ Customers                                    │
│ Sites                                        │
│ Work Orders                                  │
│ Service Requests                             │
│ Inventory                                    │
│ Notifications                               │
│ Time Logs                                    │
│ SLA / Operational Data                       │
└──────────────────────────────────────────────┘
```

---

## 👥 User Roles

KEYSTONE contains exactly four application roles.

| Role           | Main Responsibility                                |
| -------------- | -------------------------------------------------- |
| **Manager**    | User and operational management                    |
| **Dispatcher** | Dispatching, work orders and technician assignment |
| **Technician** | Assigned field jobs and job status updates         |
| **Customer**   | Service requests, sites and work-order tracking    |

---

## 📁 Project Structure

```text
KEYSTONE/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── keystone/
│   │   │   │           ├── controller/
│   │   │   │           ├── dto/
│   │   │   │           ├── entity/
│   │   │   │           ├── repository/
│   │   │   │           ├── service/
│   │   │   │           ├── security/
│   │   │   │           └── ...
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── main.tsx
    │   ├── style.css
    │   └── services/
    │       └── api.ts
    │
    ├── public/
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🔑 Authentication Flow

The application uses JWT-based authentication.

```text
User
 │
 ▼
Login
 │
 ▼
Spring Security Authentication
 │
 ▼
JWT Token Generated
 │
 ▼
Frontend Stores Token
 │
 ▼
Authorization: Bearer <token>
 │
 ▼
Protected REST API
 │
 ▼
Role-Based Access
```

The frontend uses the token for authenticated API requests.

The token is stored using the application authentication storage mechanism, including:

```text
keystone_token
```

---

## 🛡️ Authorization

Spring Security protects backend endpoints using role-based authorization.

Examples include:

```text
MANAGER
DISPATCHER
TECHNICIAN
CUSTOMER
```

Backend authorization uses Spring Security method-level security such as:

```java
@PreAuthorize("hasRole('MANAGER')")
```

and:

```java
@PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
```

This prevents users from accessing functionality outside their assigned role.

---

## 🗄️ Database

KEYSTONE uses **MySQL 8** for persistent data storage.

Database schema management is handled through **Flyway migrations**.

The project includes database structures supporting areas such as:

- Users
- Customers
- Sites
- Work Orders
- Service Requests
- Technicians
- Inventory
- Work Order Parts
- Notifications
- Time Logs
- SLA information

---

## 🔌 Backend API Modules

The backend exposes REST APIs for the main application modules.

### Authentication

```text
/api/auth
```

### Users

```text
/api/users
```

### Customers

```text
/api/customers
```

### Sites

```text
/api/sites
```

### Work Orders

```text
/api/work-orders
```

### Technicians

```text
/api/technicians
```

### Service Requests

```text
/api/customer/service-requests
/api/dispatcher/service-requests
```

### Inventory

```text
/api/inventory
/api/parts
/api/work-order-parts
```

### Notifications

```text
/api/notifications
```

The exact endpoints and authorization requirements are defined by the backend controllers.

---

## ⚙️ Backend Configuration

The backend runs on:

```text
http://localhost:8080
```

The API base path is:

```text
/api
```

Therefore, the frontend communicates with the backend using URLs such as:

```text
http://localhost:8080/api/...
```

Database connection settings should be configured in:

```text
backend/src/main/resources/application.properties
```

---

## 🚀 Running the Backend

### 1. Navigate to the backend

Windows:

```bash
cd C:\KEYSTONE-MySQL-Phase4-Customer-Sites\KEYSTONE\backend
```

### 2. Build the project

```bash
mvn clean package
```

### 3. Start Spring Boot

```bash
mvn spring-boot:run
```

The backend should start on:

```text
http://localhost:8080
```

---

## 💻 Running the Frontend

### 1. Navigate to the frontend

```bash
cd C:\KEYSTONE-MySQL-Phase4-Customer-Sites\KEYSTONE\frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite will provide the local frontend URL in the terminal.

---

## 🌐 Frontend API Configuration

The frontend API base URL can be configured using:

```text
VITE_API_URL
```

Default API URL:

```text
http://localhost:8080/api
```

Example:

```text
VITE_API_URL=http://localhost:8080/api
```

---

## 📊 Main Application Modules

### Manager Dashboard

Provides an overview of platform operations and access to management functionality.

### User Management

Managers can view existing platform users and create new:

- Manager
- Dispatcher
- Technician

accounts.

### Dispatcher Operations

Dispatchers can manage:

- Customers
- Sites
- Service Requests
- Work Orders
- Technician assignments
- Technician workload
- Inventory information

### Technician Workspace

Technicians can manage their assigned work orders and update job progress.

### Customer Portal

Customers can manage their service-related activities, including:

- Sites
- Service Requests
- Work Orders
- Notifications
- Profile

---

## 🧪 Workflow Example

A typical service workflow can be represented as:

```text
Customer
   │
   │ Creates Service Request
   ▼
Service Request
   │
   │ Dispatcher reviews request
   ▼
Work Order
   │
   │ Technician assigned
   ▼
ASSIGNED
   │
   │ Technician starts job
   ▼
IN_PROGRESS
   │
   │ Technician completes job
   ▼
COMPLETED
```

---

## 🎨 Frontend UI

The frontend provides role-specific dashboards and workspaces.

The UI includes:

- Sidebar navigation
- Dashboard cards
- Tables
- Forms
- Modal dialogs
- Status badges
- Responsive layouts
- Loading states
- Error states
- Empty states
- Role-specific navigation

---

## 📱 Responsive Design

The frontend is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile-sized screens

The interface uses responsive CSS to adapt navigation, tables, forms, and dashboard components to different screen sizes.

---

## 🔒 Security Considerations

The application implements several security mechanisms:

- JWT authentication
- BCrypt password hashing
- Role-based authorization
- Protected backend endpoints
- Active/inactive user control
- Authenticated API requests
- Server-side authorization checks

Passwords are not stored as plain text.

---

## 🧰 Development Tools

Recommended development environment:

```text
Java 21
MySQL 8
Maven
Node.js
npm
VS Code / IntelliJ IDEA / Eclipse
Git
GitHub
```

---

## 📋 Project Status

**Status: Completed**

KEYSTONE has been completed through **Phase 18.4** with the core backend, frontend, authentication, role-based workflows, database integration, and major field-service operations implemented.

The current project is in a stable, submission-ready state.

---

## 🎯 Project Objectives

The main objectives of KEYSTONE are:

- Centralize field-service operations
- Improve work-order management
- Simplify technician assignment
- Provide role-specific workflows
- Track service requests
- Manage customer sites
- Support inventory operations
- Provide secure authentication
- Improve visibility across field-service activities

---

## 📚 Learning Outcomes

This project demonstrates practical experience with:

- Java development
- Spring Boot
- Spring Security
- JWT authentication
- REST API development
- Spring Data JPA
- Hibernate
- MySQL
- Flyway migrations
- React
- TypeScript
- Vite
- Role-based access control
- Full-stack application integration
- Database management
- Frontend state management
- Responsive UI development

---

## 👨‍💻 Developer

**KEYSTONE – Field Service Management Platform**

Full-stack project developed using:

```text
Java + Spring Boot + MySQL
React + TypeScript + Vite
```

---

## 📄 License

This project is intended for educational, portfolio, demonstration, and project-submission purposes unless a separate license is provided.

---

## ⭐ KEYSTONE

> **One platform for managing field-service operations from request to completion.**
