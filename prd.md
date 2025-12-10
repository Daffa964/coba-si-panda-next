# SI-PANDA System Documentation

## Overview
SI-PANDA (Sistem Pemantau Gizi Anak Desa Kramat) is a comprehensive web application designed to digitize Posyandu workflows and help prevent stunting through proactive child health monitoring.

## Database Structure

### 1. `posyandu` Table
Stores information about Posyandu locations:
- `id`: Serial primary key
- `nama_posyandu`: Name of the Posyandu
- `lokasi`: Location details (e.g., "RW 01, Desa Kramat")

### 2. `users` Table
Manages Bidan and Kader accounts:
- `id`: Serial primary key
- `nama`: Full name of the user
- `email`: Unique email for login
- `password`: Hashed password
- `role`: 'BIDAN' or 'KADER'
- `posyandu_id`: Foreign key to posyandu (null for Bidan)
- `created_at`: Timestamp of account creation

### 3. `anak` Table
Stores children demographic information:
- `id`: Serial primary key
- `nama_anak`: Child's full name
- `jenis_kelamin`: Gender ('LAKI-LAKI' or 'PEREMPUAN')
- `tanggal_lahir`: Date of birth
- `nama_wali`: Guardian's name
- `telepon_wali`: Guardian's phone number
- `posyandu_id`: Foreign key to posyandu
- `qr_token`: Unique token for QR code generation
- `created_at`: Timestamp of registration

### 4. `pengukuran` Table
Records measurement data with Z-scores:
- `id`: Serial primary key
- `anak_id`: Foreign key to anak
- `tanggal_pengukuran`: Measurement date
- `berat_badan_kg`: Weight in kg (real type)
- `tinggi_badan_cm`: Height in cm (real type)
- `zscore_bb_u`: Z-score Weight for Age
- `zscore_tb_u`: Z-score Height for Age
- `zscore_bb_tb`: Z-score Weight for Height
- `status_gizi`: Nutritional status classification
- `dicatat_oleh`: Foreign key to users (the Kader who recorded)
- `created_at`: Timestamp of entry

## Features Implemented

### 1. User Management & Authentication (F01)
- Secure login system for Bidan and Kader roles
- Registration system for Bidan (Super Admin)
- Role-based access control
- Kader account management by Bidan

### 2. Child Data & Measurement Management (F02)
- Child registration with demographic information
- Measurement input (weight and height)
- Automatic calculation of age in months
- Automatic calculation of Z-scores (BB/U, TB/U, BB/TB)
- Nutritional status classification
- Measurement history tracking

### 3. Monitoring Dashboard with Early Warning System (F03)
- Visual dashboard for Bidan to monitor entire population
- Color-coded alerts for at-risk children (red for stunting, yellow for underweight)
- Filtering capabilities by Posyandu, nutritional status, and age range
- Quick access to child details and history

### 4. QR Code Report Generation (F04)
- Unique QR code generation for each child
- Public report page accessible without login
- Growth trend display and measurement history
- Read-only report for parents

### 5. Direct Communication via WhatsApp (F05)
- WhatsApp integration for direct communication
- One-click contact to parents from dashboard
- Accessible through the monitoring dashboard

### 6. Nutrition Recommendations (F06)
- Personalized nutrition recommendations based on nutritional status
- General guidelines for different nutritional conditions
- Age and condition-specific dietary advice

## Technical Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia Auth with PostgreSQL adapter
- **QR Codes**: qrcode library
- **Form Handling**: react-hook-form with Zod validation
- **Date Utilities**: date-fns

## Usage Instructions

### For Bidan:
1. Login with Bidan credentials
2. Access comprehensive dashboard showing all children in assigned areas
3. Monitor nutritional status with color-coded alerts
4. Manage Kader accounts
5. Access direct communication to parents
6. View detailed reports and analytics

### For Kader:
1. Login with Kader credentials
2. Access children assigned to your Posyandu
3. Input measurement data using simple forms
4. View immediate feedback on nutritional status
5. Generate QR codes for parents

### For Parents:
1. Scan QR code provided by Kader
2. Access child's growth report without login
3. View measurement history and trends
4. Access nutrition recommendations

## Security Features

- Secure password hashing with bcrypt
- Session-based authentication with Lucia
- Role-based access control
- Protected routes with middleware
- Environmental variable configuration for sensitive data

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database and update `.env`
4. Run migrations: `npm run db:migrate`
5. Seed database (optional): `npm run db:seed`
6. Start development server: `npm run dev`

## Production Deployment

1. Configure production database
2. Update environment variables
3. Run migrations: `npm run db:migrate`
4. Build the application: `npm run build`
5. Start the application: `npm start`

## API and Integration Points

The system provides:
- RESTful API endpoints for data management
- QR code generation for public reports
- WhatsApp integration for direct communication
- Export capabilities for reports
- Integration-ready architecture for future enhancements

## Future Enhancements

Potential features for future development:
- Mobile application for field data collection
- Advanced analytics and reporting
- Integration with government health systems
- Push notifications for critical cases
- Photo capture for growth tracking
- Offline data collection capabilities

## Support and Maintenance

For technical support:
- Check the documentation in the README
- Review error logs in the application
- Contact the development team for issues
- Regular updates and patches will be provided

The system is designed for long-term sustainability with clean code architecture and comprehensive documentation.

ini ubah dalamm json