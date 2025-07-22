# Expense Tracker Frontend Application

A modern React-based expense management system built with TypeScript, Material-UI, and Redux Toolkit. This application provides a comprehensive solution for tracking, managing, and analyzing business expenses.

## 🚀 Features

- **User Authentication** - Secure login/logout with JWT tokens
- **Expense Management** - Create, view, edit, and delete expenses
- **Status Workflow** - Pending, approved, and rejected expense states
- **Advanced Filtering** - Filter by category, status, and date ranges
- **Dashboard Analytics** - Visual insights and expense statistics
- **Responsive Design** - Mobile-first approach with Material-UI
- **Real-time Updates** - Optimistic UI updates for better UX
- **Role-based Access** - Different permissions for employees and admins

## 📁 Project Structure



## 📂 Folder Explanations

### `/public`
Contains static assets that are served directly by the web server. Files here are not processed by webpack and maintain their original names.

### `/src/components`
Reusable UI components that can be used across different pages. Each component focuses on a specific functionality and follows React best practices.

### `/src/components/layout`
Layout-specific components that define the overall structure and navigation of the application.

### `/src/constants`
Centralized location for application-wide constants like API endpoints, expense categories, user roles, and validation rules.

### `/src/pages`
Page-level components that correspond to different routes in the application. These components typically combine multiple smaller components.

### `/src/services`
API service layer that handles all HTTP requests to the backend. Includes authentication, expense management, and base API configuration.

### `/src/store`
Redux state management setup using Redux Toolkit. Contains store configuration and slices for different feature domains.

### `/src/store/slices`
Redux Toolkit slices that define state structure, actions, and reducers for specific features like authentication and expense management.

### `/src/types`
TypeScript type definitions, interfaces, and enums used throughout the application for type safety.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

