# ImpactKart – Charity Donation Platform (Backend)

ImpactKart is a backend-driven charity donation platform built using Node.js, Express, and Sequelize.  
It allows users to donate to verified charities, charities to manage impact reports, and admins to moderate the platform.

---

## Features

- User authentication (JWT)
- Role-based access control (USER / CHARITY / ADMIN)
- Charity registration & admin approval
- Secure donation flow (Razorpay)
- Donation history & receipt download (PDF)
- Email notifications
- Impact reports by charities
- Admin dashboard APIs

---

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Payments**: Razorpay
- **Emails**: Nodemailer (free SMTP)
- **PDF Generation**: PDFKit

---

## Project Setup

1-Clone Repository

$ git clone https://github.com/Manu22-cloud-cell/ImpactKart-Charity-Donation-Platform-Backend.git
$ cd ImpactKart-backend

2-Install Dependencies

$ npm install

3-Configure Environment Variables

Create .env file and fill in environment variables

PORT=

//Database
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_DIALECT=

//JWT
JWT_SECRET=

//Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

//mailtrap email service
MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USER=
MAILTRAP_PASS=
EMAIL_FROM=
 
4-Run Application

npm run dev

*AUTHENTICATION*

JWT-based authentication
Token must be sent in header: Authorization: Bearer <token>

*API ENDPOINTS*

1-User APIs

* Register User
POST /api/auth/register

{
  "name": "John Doe",
  "email": "john@gmail.com",
  "phone": "9999999999",
  "password": "password123"
}

* Login User
POST /api/auth/login

* Get User Profile
GET /api/users/profile
Auth required

* Update User Profile
PUT /api/users/profile

*Get User Donations
GET /api/users/donations

2-Charity APIs

* Register Charity
POST /api/charities
Auth required(User role)

* Update Charity
PUT /api/charities
Auth required(Charity role)

* Get Approved Charities
GET /api/charities

* Get Charity by ID
GET /api/charities/:id

3-Donation APIs

* Create Donation Order
POST /api/donations/create
Auth required

{
  "amount": 500,
  "charityId": 1
}

* Verify Payment
POST /api/donations/verify

* Get My Donations
GET /api/donations/my
Auth required

* Download Donation Receipt (PDF)
GET /api/donations/:id/receipt
Auth required

4-Impact Reports APIs

* Create Impact Report
POST /api/impact-reports
Auth required (CHARITY)

* Get Reports by Charity
GET /api/impact-reports/:charityId

5-Admin APIs

**Admin role required**

* Get all charities
GET /api/admin/charities

* Get Pending Charities
GET /api/admin/charities/pending

* Approve Charity
PUT /api/admin/charities/:id/approve

* Reject Charity
PUT /api/admin/charities/:id/reject

* Get All Users
GET /api/admin/users

* Update User Role
PUT /api/admin/users/:id/role

{
  "role": "ADMIN"
}

* Get All Donations
GET /api/admin/donations

## Roles & Permissions

| Role    | Permissions                         |
| ------- | ----------------------------------- |
| USER    | Donate, view history                |
| CHARITY | Create charity, post impact reports |
| ADMIN   | Approve charities, manage users     |

## Notes

Razorpay webhooks are planned for future improvements
Pagination & deployment not implemented yet (learning-focused project)

## Author
Manoj K Y
Backend Developer (Node.js)

## License
This project is for learning purposes only.








