const Listing = require("../models/listings");
const ExpressError = require("../utils/expressError");
const { categories } = require("../utils/categories");

module.exports.index = async (req, res) => {
    const searchQuery = req.query.q?.trim();
    const filter = req.query.category ? { category: req.query.category } : {};

    if (searchQuery) {
        filter.$or = [
            { title: { $regex: searchQuery, $options: "i" } },
            { location: { $regex: searchQuery, $options: "i" } },
            { country: { $regex: searchQuery, $options: "i" } },
        ];
    }

    const allListings = await Listing.find(filter);
    res.render("index.ejs", { allListings, selectedCategory: req.query.category, searchQuery, categories });
};

module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs", { categories });
};

module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate("reviews")
        .populate("owner");
    if (!listing) throw new ExpressError(404, "Listing not found");
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing , originalImageUrl });

};

module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate("reviews")
        .populate("owner");
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("edit.ejs", { listing, categories });
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
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }
    newListing.owner = req.user._id;
    await newListing.save();
    res.redirect("/");
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroy = async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect("/");
};
