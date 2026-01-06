# RAC Frontend Application

A modern React/Next.js frontend for the RAC application, providing user authentication and company management.

## Features

- 🔐 User Authentication (Login/Register)
- 🏢 Company Management (Create, Read, Update, Delete)
- 💼 User Dashboard
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive Design
- 🔒 Secure cookie-based authentication

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Kong gateway reachable (e.g., `http://kong.local:8000`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL if different (defaults to Kong):
```
NEXT_PUBLIC_API_URL=http://kong.local:8000/api
```

If using `kong.local`, add an `/etc/hosts` entry pointing to your Kong proxy IP
or use the URL from `minikube service kong-proxy --url`.

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001)

### Build

Build for production:
```bash
npm run build
npm start
```

## Pages

- **/** - Redirects to login
- **/login** - User login page
- **/register** - User registration page
- **/dashboard** - User dashboard with company management

## API Integration

The frontend connects to the user-service backend with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/users/me` - Get current user

### Companies
- `GET /api/companies` - List all user companies
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Layout.tsx
│   │   ├── CompanyForm.tsx
│   │   └── CompanyList.tsx
│   ├── pages/          # Next.js pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── dashboard.tsx
│   ├── services/       # API services
│   │   └── api.ts
│   ├── styles/         # Global styles
│   │   └── globals.css
│   └── types/          # TypeScript types
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Company Fields

When creating/editing a company, the following fields are available:

- **Company Name** * - Name of the company
- **Street and Number** * - Primary address
- **Street Additional** - Additional address line
- **Postal Code** * - Postal/ZIP code
- **City** * - City name
- **IBAN** * - International Bank Account Number (15-34 chars)
- **BIC/SWIFT** * - Bank Identifier Code (8-11 chars)
- **Registration Number** * - Company registration number
- **VAT ID** - VAT identification number
- **Document Location** - Where documents are stored
- **Additional Info** - Free text field for notes
- **VAT Payer** - Checkbox indicating VAT status
- **Reverse Charge** - Checkbox for reverse charge mechanism

\* Required fields

## Authentication Flow

1. User registers or logs in
2. JWT token is set in an HTTP-only cookie
3. Token is automatically sent with each request
4. Protected routes check for authentication
5. Logout clears the cookie

## Development Notes

- The app uses cookie-based authentication with `withCredentials: true`
- All API calls go through the centralized axios instance in `services/api.ts`
- TypeScript types are defined in `types/index.ts`
- Tailwind custom classes are defined in `globals.css`

## Troubleshooting

### CORS Issues
Kong CORS plugin should allow your frontend origin (not `*` when `credentials: true`).
Set `origins` in the Kong config to your frontend URL, e.g. `http://localhost:3001`.

### Cookie Not Set
Ensure cookies have the correct configuration:
- `sameSite: 'none'` with `secure: true` for cross-origin (production)
- `sameSite: 'lax'` for same-origin (development)
