const express = require('express');
const router = express.Router({ mergeParams: true });
const querystring = require("querystring");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/expressError");
const { listingSchema, reviewSchema } = require("../schema.js");
const { isLoggedIn ,isReviewAuthor} = require('../middleware');
const reviewController = require("../controllers/reviews");
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

function validateReview(req, res, next) {
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
}
//add a review to a listing
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewController.create));
//Delete Review Route
router.delete(
    "/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroy)
);

module.exports = router;
