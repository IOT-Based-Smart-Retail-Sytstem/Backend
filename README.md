# Scan-and-Go Retail Backend System

A modern backend system for a scan-and-go retail experience, built with Node.js, TypeScript, Socket.IO, Firebase, and MongoDB. This project supports real-time cart management, user authentication, and seamless integration with cloud services.

---

## 🚀 Project Overview

This backend powers a retail system where users can scan products, manage their cart, and checkout in real time. It supports:

- User authentication (JWT)
- Real-time cart/product updates (Socket.IO)
- Firebase integration for product and cart data
- Role-based access (user/admin)
- Modular, scalable codebase

---

## 🌐 Live Deployment

The backend server is deployed and accessible at:
**[https://faint-ilyse-iot-based-smart-retail-system-897f175c.koyeb.app/](https://faint-ilyse-iot-based-smart-retail-system-897f175c.koyeb.app/)**

- Use this URL as the base for your API requests and Socket.IO connections.
- Update your frontend or client applications to use this endpoint in production.

---

## ✨ Features

- **User Registration & Login**
- **Email Verification & Password Reset**
- **Scan-and-Go Cart Management**
- **Product & Category Management**
- **Wishlist Support**
- **Admin Controls**
- **Real-Time Updates via Socket.IO**
- **Firebase Cloud Sync**

---

## 📁 Folder Structure

```
src/
  models/           # Mongoose/Typegoose models (user, product, cart, etc.)
  services/         # Business logic (cart, user, product, etc.)
    firebase/       # Firebase integration
    socket/         # Socket.IO event handlers
  controllers/      # Express route handlers
  routes/           # Express route definitions
  middlware/        # Express middlewares
  utils/            # Utility functions (JWT, logger, etc.)
  schema/           # Validation schemas
  config/           # Configuration files
  app.ts            # App entry point
```

---

## ⚙️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values (MongoDB URI, JWT keys, Firebase config, etc.)
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGO_URL=your_mongodb_uri
PORT=3000
JWT_PRIVATE_KEY=your_jwt_private_key
JWT_PUBLIC_KEY=your_jwt_public_key
STRIPE_SECRET_KEY=your_stripe_secret
FIREBASE_DATABASE_URL=your_firebase_db_url
# ...other secrets
```

---

## 🛠️ Usage

- **API:** Use Postman or similar tools to interact with the REST API endpoints (see `routes/` for available endpoints).
- **Socket.IO:** Connect a client to `/cart` or `/shelf` namespaces for real-time updates.
- **Firebase:** Ensure your Firebase project is set up and credentials are correct.

---

## 🤝 Contributing

1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙋‍♂️ Questions?

Open an issue or contact the maintainer for help!
