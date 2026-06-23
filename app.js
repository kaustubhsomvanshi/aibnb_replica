const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path=require("path");

main().then(() => {
    console.log("connected to DB");
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

app.get("/", (req, res) => {
    res.send("This is root");
});

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("/listings/index.ejs", { allListings });
});

app.get("/listings/new", (req, res) => {
    res.render("/listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("/listings/show.ejs", { listing });
})

//create a new listing
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.Listing);
    await newListing.save();
    res.redirect("/listings");
});

//edit a listing
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("/listings/edit.ejs", { listing });
});
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
//update a listing
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.Listing});
    res.redirect(`/listings/${id}`);
});