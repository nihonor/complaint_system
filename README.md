# Complaint Management System

A modern web application for submitting, tracking, and managing complaints. Features user and admin dashboards, authentication, agency/category management, and more.

---

## 🚀 Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/nihonor/complaint_system
cd complaint_system
```

### 2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

### 3. **Set Up Environment Variables**

- Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

- Edit `.env` to set up your database URL and authentication secrets (e.g., for NextAuth, Prisma, etc).

### 4. **Set Up the Database**

- Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

- (Optional) Seed the database if a seed script is provided:

```bash
npx prisma db seed
```

### 5. **Start the Development Server**

```bash
npm run dev
# or
yarn dev
```

- Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features

- **User Authentication** (NextAuth): Sign up, log in, and secure access to features.
- **User Dashboard:**
  - View complaint stats (submitted, in progress, resolved)
  - See recent complaints and their statuses
  - Submit new complaints
- **Admin Dashboard:**
  - Overview of all complaints, agencies, categories, and users
  - Visual stats and charts
  - Manage agencies and categories (add, delete)
  - View and respond to complaints
- **Complaint Management:**
  - Submit complaints with title, description, category, agency, location, and priority
  - Track complaint status and responses
- **Agency & Category Management:**
  - Admins can add, view, and delete agencies and categories
- **Role-Based Access:**
  - Only admins can access admin features
  - Users can only see and manage their own complaints
- **Modern UI:**
  - Responsive, accessible, and visually appealing design
  - Loading skeletons and error handling

---

## 🛠️ Tech Stack

- Next.js (App Router)
- React
- NextAuth (authentication)
- Prisma (ORM)
- PostgreSQL (or your preferred database)
- Tailwind CSS & Radix UI (styling)

---

## 📝 Customization & Deployment

- Update `.env` for your production database and secrets
- Build for production:

```bash
npm run build
npm start
```

- Deploy to Vercel, Netlify, or your preferred platform

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)
