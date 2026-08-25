const Listing = require("../models/listings");
const ExpressError = require("../utils/expressError");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");
};

module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate("reviews")
        .populate("owner");
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("edit.ejs", { listing });
};

module.exports.show = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("show.ejs", { listing });
};

module.exports.create = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    res.redirect("/");
};

module.exports.update = async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(
        req.params.id,
        { ...req.body.listing },
        { runValidators: true, new: true }
    );
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroy = async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect("/");
};