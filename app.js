if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const querystring = require("querystring");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const dbUrl = process.env.ATLASDB_URL;
const path=require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressError");
const { listingSchema, reviewSchema } = require("./schema.js");
const MongoStore = require("connect-mongo").default;
const Review = require("./models/review"); 
const listings = require("./routes/listing.js"); 
const users = require("./routes/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");   

main().then(() => {
    console.log("connected to DB");
    app.listen(8080, () => {
        console.log("Server is running on port 8080");
    });
}).catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

const normalizeBracketedBody = (body) => {
    if (typeof body !== "object" || body === null) return body;
    const normalized = {};
    for (const [key, value] of Object.entries(body)) {
        if (key.includes("[")) {
            const parts = key.replace(/\]/g, "").split("[");
            let target = normalized;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    target[part] = value;
                } else {
                    if (!Object.prototype.hasOwnProperty.call(target, part) || typeof target[part] !== "object") {
                        target[part] = {};
                    }
                    target = target[part];
                }
            }
        } else {
            normalized[key] = value;
        }
    }
    return normalized;
};



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true, type: ["application/x-www-form-urlencoded", "text/html"] }));
app.use(methodOverride("_method"));
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
app.use(session({
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.use("/listings",listings);
app.use("/", users);
app.use("/listings/:id/reviews", require("./routes/review.js"));

app.get("/seed-database-now", async (req, res) => {
    try {
        const { initDB } = require("./initial_data/index.js");
        await initDB();
        res.send("Database seeded successfully! You can now ask me to remove this route.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error seeding database: " + err.message);
    }
});
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    if (req.accepts("html")) {
        return res.status(statusCode).render("error", { err });
    }
    res.status(statusCode).json({ error: message });
});
