const initData = require("./data.js");
const Listing = require("../models/listings");
const Review = require("../models/review");

const sampleReviewTemplates = [
  { author: "Alex", rating: 5, comment: "Amazing stay with a stunning view and wonderful hospitality." },
  { author: "Priya", rating: 4, comment: "Very comfortable, clean, and in a great location." },
  { author: "Jordan", rating: 5, comment: "Perfect for a weekend getaway and everything felt effortless." },
  { author: "Sara", rating: 4, comment: "Stylish and cozy, and I would book it again." },
  { author: "Mina", rating: 5, comment: "Quiet, relaxing, and surrounded by beautiful nature." },
  { author: "Ravi", rating: 5, comment: "Loved the atmosphere and the thoughtful little touches." },
  { author: "Emma", rating: 4, comment: "Charming and full of character, with a lovely neighborhood feel." },
  { author: "Liam", rating: 5, comment: "Beautiful home with authentic local charm and great comfort." },
  { author: "Noah", rating: 5, comment: "So peaceful and relaxing, we absolutely loved the stay." },
  { author: "Ananya", rating: 4, comment: "A unique place with plenty of personality and charm." },
  { author: "Sofia", rating: 5, comment: "The views were incredible and the stay felt effortless." },
  { author: "Mateo", rating: 5, comment: "Very relaxing experience with excellent amenities and comfort." },
];

const buildReviewsForListing = (index) => {
  const first = sampleReviewTemplates[index % sampleReviewTemplates.length];
  const second = sampleReviewTemplates[(index + 3) % sampleReviewTemplates.length];

  return [
    { ...first },
    {
      ...second,
      rating: Math.min(5, second.rating + (index % 2 === 0 ? 0 : -1)),
      comment: `${second.comment} We would recommend it.`,
    },
  ];
};

const initDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});
  const listings = await Listing.insertMany(initData.data);

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const reviews = buildReviewsForListing(i);
    const createdReviews = await Review.insertMany(reviews);
    listing.reviews.push(...createdReviews.map((review) => review._id));
    await listing.save();
  }
  console.log("data was initialized");
};

module.exports = { initDB };
