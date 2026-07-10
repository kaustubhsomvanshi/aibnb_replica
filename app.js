const express = require("express");
const querystring = require("querystring");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Listing = require("./models/listings");
const { initDB } = require("./initial_data");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path=require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressError");
const { listingSchema } = require("./schema.js");
main().then(async () => {
    console.log("connected to DB");
    await initDB();
}).catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true, type: ["application/x-www-form-urlencoded", "text/html"] }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.send("This is root");
});

app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
}));

app.get("/listings/new", (req, res) => {
    res.render("new.ejs");
});

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("edit.ejs", { listing });
}));

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("show.ejs", { listing });
}));

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

const validateListing = (req, res, next) => {
    let body = req.body;
    if (typeof body === "string") {
        body = querystring.parse(body);
    }
    body = normalizeBracketedBody(body);
    if (!body.listing && Object.keys(body).length) {
        body = { listing: body };
    }
    const { error, value } = listingSchema.validate(body, { abortEarly: false });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    req.body = value;
    next();
};

//Create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);


//update a listing
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listingData = req.body.listing;
    const listing = await Listing.findByIdAndUpdate(id, { ...listingData }, { runValidators: true, new: true });
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect(`/listings/${id}`);
}));
//delete a listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect("/listings");
}));

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

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});