const Review = require("../models/review");
const Listing = require("../models/listings");

module.exports.create = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review._id);

    await review.save();
    await listing.save();
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroy = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
};