const express = require("express");
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
app.use(express.urlencoded({ extended: true }));
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

//create a new listing

app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//update a listing
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listingData = req.body.listing || req.body.Listing;
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