const express = require('express');
const router = express.Router();
const querystring = require("querystring");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/expressError");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listings");
const { isLoggedIn, isOwner } = require("../middleware.js");

router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
}));

router.get("/new", (req, res) => {
    res.render("new.ejs");
});

router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner"); ;
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.render("edit.ejs", { listing });
}));

router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
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
        return next(new ExpressError(400, message));    
    }
    req.body = value;
    next();
};


//Create Route
router.post(
  "/",
  validateListing,
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user's ID
    await newListing.save();
    res.redirect("/");
  })
);


//update a listing
router.put("/:id", validateListing, isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listingData = req.body.listing;
    const listing = await Listing.findByIdAndUpdate(id, { ...listingData }, { runValidators: true, new: true });
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect(`/${id}`);
}));
//delete a listing
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    res.redirect("/");
}));
module.exports = router;