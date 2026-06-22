const express = require("express");
const app = express();
const mongoose = require("mongoose");

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

app.get("/", (req, res) => {
    res.send("This is root");
});

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("/listings/index.ejs", { allListings });
});

app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("/listings/show.ejs", { listing });
})

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});