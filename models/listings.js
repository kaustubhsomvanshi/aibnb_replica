const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default: "https://www.flaticon.com/free-icon/resort_6254195",
    set: (v) => {
      if (v === "" || v == null) {
        return "https://www.flaticon.com/free-icon/resort_6254195";
      }
      if (typeof v === "object" && v !== null && typeof v.url === "string") {
        return v.url;
      }
      return v;
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
  {
    type: Schema.Types.ObjectId,
    ref: "Review",
  },
  ],
  owner: {
    type:Schema.Types.ObjectId,
    ref:"User",
  }

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
