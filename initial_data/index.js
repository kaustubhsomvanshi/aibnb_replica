const initData = require("./data.js");
const Listing = require("../models/listings");

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

module.exports = { initDB };
