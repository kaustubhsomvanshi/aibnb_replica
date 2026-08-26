const initData = require("./data.js");
const Listing = require("../models/listings");
const Review = require("../models/review");
const User = require("../models/user");
const mongoose = require("mongoose");

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
  const withoutAuthor = ({ author, ...review }) => review;

  return [
    withoutAuthor(first),
    {
      ...withoutAuthor(second),
      rating: Math.min(5, second.rating + (index % 2 === 0 ? 0 : -1)),
      comment: `${second.comment} We would recommend it.`,
    },
  ];
};

const createSeedUsers = async () => {
  const usernames = [...new Set(sampleReviewTemplates.map((review) => review.author))];
  const users = {};

  for (const username of usernames) {
    const user = new User({
      username,
      email: `${username.toLowerCase()}@example.com`,
    });
    users[username] = await User.register(user, "password123");
  }

  return users;
};

const initDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});
  const users = await createSeedUsers();
  const userList = Object.values(users);
  const listings = await Listing.insertMany(initData.data);

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    listing.owner = userList[i % userList.length]._id;
    await listing.save();

    const reviews = buildReviewsForListing(i).map((review) => ({
      ...review,
      author: userList[(i + review.rating) % userList.length]._id,
    }));
    const createdReviews = await Review.insertMany(reviews);
    listing.reviews.push(...createdReviews.map((review) => review._id));
    await listing.save();
  }
  console.log("data was initialized");
};

module.exports = { initDB };

if (require.main === module) {
  require("dotenv").config();
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

  mongoose.connect(mongoUrl)
    .then(initDB)
    .then(() => mongoose.disconnect())
    .catch(async (err) => {
      console.error(err);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}
