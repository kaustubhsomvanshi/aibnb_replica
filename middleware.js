const Listing = require("./models/listing");
const ExpressError = require("../utils/expressError");
const { listingSchema, reviewSchema } = require("../schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
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

module.exports.validateReview = (req, res, next) => {
    let body = req.body;
    if (typeof body === "string") {
        body = querystring.parse(body);
    }
    body = normalizeBracketedBody(body);
    if (!body.review && Object.keys(body).length) {
        body = { review: body };
    }
    const { error, value } = reviewSchema.validate(body, { abortEarly: false });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        return next(new ExpressError(400, message));
    }
    req.body = value;
    next();
};