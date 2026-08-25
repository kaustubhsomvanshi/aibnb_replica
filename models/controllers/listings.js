const Listing = require("../models/listings");
module.exports.index = wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
});