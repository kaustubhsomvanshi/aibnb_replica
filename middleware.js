const querystring = require("querystring");
const Review = require("./models/review");
const Listing = require("./models/listings");
const ExpressError = require("./utils/expressError");
const { listingSchema, reviewSchema } = require("./schema.js");

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
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
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

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        return next(new ExpressError(404, "Review not found"));
    }
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
