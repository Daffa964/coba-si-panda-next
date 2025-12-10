# SI-PANDA (Sistem Pemantau Gizi Anak Desa Kramat)

A comprehensive web application designed to digitize Posyandu workflows and help prevent stunting through proactive child health monitoring.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Database Schema](#database-schema)
- [Technical Stack](#technical-stack)
- [Installation](#installation)
- [Usage Instructions](#usage-instructions)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Support](#support)

## Overview

SI-PANDA (Sistem Pemantau Gizi Anak Desa Kramat) is a web-based solution that digitizes traditional Posyandu workflows, enabling healthcare workers to efficiently monitor child nutrition and prevent stunting. The system provides comprehensive tracking of child growth metrics with automated Z-score calculations, early warning systems, and accessible reporting for parents.

## Features

### F01: User Management & Authentication
- Secure login system for Bidan and Kader roles
- Registration system for Bidan (Super Admin)
- Role-based access control
- Kader account management by Bidan

### F02: Child Data & Measurement Management
- Child registration with demographic information
- Measurement input (weight and height)
- Automatic calculation of age in months
- Automatic calculation of Z-scores (BB/U, TB/U, BB/TB)
- Nutritional status classification
- Measurement history tracking

### F03: Monitoring Dashboard with Early Warning System
- Visual dashboard for Bidan to monitor entire population
- Color-coded alerts for at-risk children (red for stunting, yellow for underweight)
- Filtering capabilities by Posyandu, nutritional status, and age range
- Quick access to child details and history

### F04: QR Code Report Generation
- Unique QR code generation for each child
- Public report page accessible without login
- Growth trend display and measurement history
- Read-only report for parents

### F05: Direct Communication via WhatsApp
- WhatsApp integration for direct communication
- One-click contact to parents from dashboard
- Accessible through the monitoring dashboard

### F06: Nutrition Recommendations
- Personalized nutrition recommendations based on nutritional status
- General guidelines for different nutritional conditions
- Age and condition-specific dietary advice

## Database Schema

### `posyandu` Table
| Column | Type | Description |
|--------|------|-------------|
| id | Serial | Primary key |
| nama_posyandu | String | Name of the Posyandu |
| lokasi | String | Location details (e.g., "RW 01, Desa Kramat") |

### `users` Table
| Column | Type | Description |
|--------|------|-------------|
| id | Serial | Primary key |
| nama | String | Full name of the user |
| email | String | Unique email for login |
| password | String | Hashed password |
| role | Enum (BIDAN/KADER) | Role of the user |
| posyandu_id | Serial (FK) | Foreign key to posyandu (null for Bidan) |
| created_at | Timestamp | Timestamp of account creation |

### `anak` Table
| Column | Type | Description |
|--------|------|-------------|
| id | Serial | Primary key |
| nama_anak | String | Child's full name |
| jenis_kelamin | Enum (LAKI-LAKI/PEREMPUAN) | Gender |
| tanggal_lahir | Date | Date of birth |
| nama_wali | String | Guardian's name |
| telepon_wali | String | Guardian's phone number |
| posyandu_id | Serial (FK) | Foreign key to posyandu |
| qr_token | String | Unique token for QR code generation |
| created_at | Timestamp | Timestamp of registration |

### `pengukuran` Table
| Column | Type | Description |
|--------|------|-------------|
| id | Serial | Primary key |
| anak_id | Serial (FK) | Foreign key to anak |
| tanggal_pengukuran | Date | Measurement date |
| berat_badan_kg | Real | Weight in kg |
| tinggi_badan_cm | Real | Height in cm |
| zscore_bb_u | Real | Z-score Weight for Age |
| zscore_tb_u | Real | Z-score Height for Age |
| zscore_bb_tb | Real | Z-score Weight for Height |
| status_gizi | String | Nutritional status classification |
| dicatat_oleh | Serial (FK) | Foreign key to users (the Kader who recorded) |
| created_at | Timestamp | Timestamp of entry |

## Technical Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia Auth with PostgreSQL adapter
- **QR Codes**: qrcode library
- **Form Handling**: react-hook-form with Zod validation
- **Date Utilities**: date-fns

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Git

### Steps
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/si-panda.git
   cd si-panda
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up PostgreSQL database and update `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sipanda_db"
   LUCIA_SECRET_KEY="your_lucia_secret_key"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. Run database migrations:
   ```
   npm run db:migrate
   ```

5. (Optional) Seed the database:
   ```
   npm run db:seed
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open your browser to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage Instructions

### For Bidan:
1. Navigate to `/login` and log in with Bidan credentials
2. Access the comprehensive dashboard showing all children in assigned areas
3. Use color-coded alerts to identify at-risk children (red for stunting, yellow for underweight)
4. Manage Kader accounts through the user management section
5. Access direct communication buttons to contact parents via WhatsApp
6. View detailed reports and analytics for program evaluation

### For Kader:
1. Navigate to `/login` and log in with Kader credentials
2. Access children assigned to your Posyandu
3. Input measurement data using the simple measurement forms
4. View immediate feedback on nutritional status after measurements
5. Generate QR codes for parents to share access to reports

### For Parents:
1. Request the QR code from the Kader after measurement
2. Scan the QR code using any smartphone camera or QR scanner app
3. Access your child's growth report without requiring login
4. View measurement history and growth trends over time
5. Access nutrition recommendations specific to your child's status

### Admin Functions:
1. Super admin can manage Bidan accounts
2. Admin can configure Posyandu information
3. System-wide configuration settings
4. Data backup and recovery options

## User Roles

### Bidan
- Full access to assigned Posyandu children
- Ability to record measurements
- Access to all system reports and analytics
- Kader account management
- Direct parent communication features

### Kader
- Access limited to assigned Posyandu
- Ability to record measurements for children
- QR code generation for parents
- Limited report viewing capabilities

### Parent/Guardian
- Read-only access through QR code
- View only child's specific information
- Access to growth reports and trends
- Nutrition recommendations

## API Documentation

The system provides RESTful API endpoints for data management:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Children Management
- `GET /api/anak` - Get all children for user's posyandu
- `POST /api/anak` - Register new child
- `GET /api/anak/:id` - Get specific child information
- `PUT /api/anak/:id` - Update child information
- `DELETE /api/anak/:id` - Delete child record

### Measurements
- `GET /api/pengukuran` - Get measurements for assigned children
- `POST /api/pengukuran` - Record new measurements
- `GET /api/pengukuran/:id` - Get specific measurement
- `GET /api/pengukuran/anak/:anakId` - Get measurements for specific child

### Posyandu
- `GET /api/posyandu` - Get all posyandus
- `POST /api/posyandu` - Create new posyandu
- `GET /api/posyandu/:id` - Get specific posyandu

### Users
- `GET /api/users` - Get users (filtered by role)
- `POST /api/users` - Create new user (by admin)
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user

## Security Features

- Secure password hashing with bcrypt
- Session-based authentication with Lucia
- Role-based access control (RBAC)
- Protected routes with middleware
- Environmental variable configuration for sensitive data
- Input validation and sanitization
- SQL injection prevention through ORM usage
- XSS protection through framework safeguards

## Development Guidelines

### Code Standards
- Follow Next.js 15 with App Router patterns
- Use Tailwind CSS for consistent styling
- Implement Zod for schema validation
- Maintain proper TypeScript typing
- Write unit tests for critical components

### Naming Conventions
- Component names: PascalCase (e.g., `DashboardPage`)
- Function names: camelCase (e.g., `calculateZScore`)
- File names: kebab-case (e.g., `dashboard-page.tsx`)
- Database tables: snake_case (e.g., `nama_posyandu`)

### Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Accessibility testing for all pages

### Database Migrations
- Use Drizzle kit for schema changes
- Version control all migration files
- Test migrations on development database first
- Document breaking changes in release notes

## Deployment

### Production Setup
1. Configure production database environment
2. Update environment variables for production
3. Build the application:
   ```
   npm run build
   ```

4. Run migrations in production environment:
   ```
   npm run db:migrate
   ```

5. Start the production server:
   ```
   npm start
   ```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://prod_username:prod_password@prod_host:5432/prod_db"
LUCIA_SECRET_KEY="secure_production_secret_key"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### Recommended Hosting Platforms
- Vercel (optimized for Next.js)
- AWS (EC2, ECS, or Lambda)
- Google Cloud Platform
- DigitalOcean App Platform
- Railway.sh

### SSL Certificate Configuration
- Configure HTTPS with SSL certificate
- Redirect all HTTP traffic to HTTPS
- Secure cookies with secure flag
- Enable HSTS header

## Future Enhancements

- Mobile application for field data collection
- Advanced analytics and reporting
- Integration with government health systems
- Push notifications for critical cases
- Photo capture for growth tracking
- Offline data collection capabilities
- Multi-language support
- Advanced dashboard with data visualization
- Automated nutrition recommendation system

## Support

### Technical Support
- Check the documentation in this README
- Review application error logs
- Contact the development team for critical issues
- Submit issues through GitHub Issues

### Training Resources
- Video tutorials for system usage
- Documentation for each feature
- User manuals for different roles
- Troubleshooting guides

### Maintenance
- Regular security updates
- Performance optimizations
- Bug fixes and stability improvements
- Database maintenance and optimization
- Backup and recovery procedures

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

- Project Team
- Contributors

## Acknowledgments

- Desa Kramat community for their collaboration
- Healthcare professionals for guidance
- Government health department for specifications