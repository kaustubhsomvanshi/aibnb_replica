const express = require('express');
const router = express.Router();
const querystring = require("querystring");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/expressError");
const { listingSchema, reviewSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
router.route("/").get(wrapAsync(listingController.index)).post(isLoggedIn, validateListing, wrapAsync(listingController.create));
router.get("/new", listingController.renderNewForm);
router.route("/:id").get(wrapAsync(listingController.show)).put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.update)).delete(isLoggedIn, isOwner, wrapAsync(listingController.destroy));
router.get("/:id/edit", wrapAsync(listingController.renderEditForm));

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

module.exports = router;