# Roamly (Airbnb Clone) 🌍🏠

Roamly is a full-stack web application inspired by Airbnb. It allows users to discover, list, and review unique accommodations. Built with a robust Node.js backend and a MongoDB database, it features secure authentication, image uploads, and interactive maps.

## 🚀 Live Demo
**[Insert Your Live Deployment URL Here]**

## ✨ Features
- **User Authentication:** Secure sign-up, login, and logout using `Passport.js`.
- **Listing Management:** Authenticated users can create, edit, and delete their own property listings.
- **Image Uploads:** Seamless image hosting and management via **Cloudinary**.
- **Interactive Maps:** Real-time geocoding and map rendering using **OpenStreetMap** and **Leaflet**.
- **Reviews & Ratings:** Users can leave detailed reviews and ratings on properties they've visited.
- **Security:** Protected routes, session management (stored in MongoDB), and environment variable protection.

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, EJS (Embedded JavaScript templating), JavaScript, OpenStreetMap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Image Hosting:** Cloudinary
- **Authentication:** Passport.js (Local Strategy)
- **Deployment:** [Insert your hosting provider, e.g., Render / Heroku]

## 💻 Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kaustubhsomvanshi/aibnb_replica.git
   cd aibnb_replica
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following credentials:
   ```env
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ATLASDB_URL=your_mongodb_atlas_connection_string
   SECRET=your_express_session_secret
   ```

4. **Initialize the Database (Optional):**
   To populate the database with sample listings and users:
   ```bash
   npm run seed
   ```

5. **Start the Server:**
   ```bash
   npm start
   ```
   The app will run at `http://localhost:8080`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is open-source and available under the ISC License.
