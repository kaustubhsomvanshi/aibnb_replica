# Roamly (Airbnb Clone)

I built Roamly as a full-stack Airbnb clone where people can find, list, and review unique places to stay. Under the hood, it runs on Node.js and Express with a MongoDB database. I spent a lot of time figuring out how to handle secure user accounts, get cloud image uploads working, and integrate interactive maps. 

One thing I'm really proud of with this project is that I wrote about 90% of it completely manually by digging through official documentations. Only around 10% of it was "vibecoded". It was a massive learning experience!

##  Live Demo
https://airbnb-replica-dcr1.onrender.com

##  What it does
- **User accounts:** Handled sign-ups, logins, and logouts securely using `Passport.js`.
- **Managing listings:** If you're logged in, you can create new property listings, edit the details, or delete them.
- **Image uploads:** Wired up **Cloudinary** so users can easily upload photos of their spaces.
- **Maps:** Used **OpenStreetMap** and **Leaflet** for real-time geocoding to actually show exactly where properties are located.
- **Reviews:** Users can drop ratings and write reviews for places they've checked out.
- **Security stuff:** Set up protected routes, stored sessions properly in MongoDB, and made sure all environment variables are safely hidden.

##  What I used
- **Frontend:** HTML, CSS, EJS, vanilla JavaScript, OpenStreetMap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas & Mongoose
- **Image Storage:** Cloudinary
- **Auth:** Passport.js (Local Strategy)
- **Deployment:** Render
