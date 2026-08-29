const categories = [
  { value: "trending", label: "Trending", icon: "fa-fire" },
  { value: "rooms", label: "Rooms", icon: "fa-bed" },
  { value: "iconic-cities", label: "Iconic Cities", icon: "fa-mountain-city" },
  { value: "mountains", label: "Mountains", icon: "fa-mountain" },
  { value: "castles", label: "Castles", icon: "fa-fort-awesome" },
  { value: "amazing-pools", label: "Amazing Pools", icon: "fa-person-swimming" },
  { value: "camping", label: "Camping", icon: "fa-campground" },
  { value: "farms", label: "Farms", icon: "fa-tractor" },
  { value: "arctic", label: "Arctic", icon: "fa-snowflake" },
  { value: "domes", label: "Domes", icon: "fa-igloo" },
  { value: "boats", label: "Boats", icon: "fa-sailboat" },
];

module.exports = {
  categories,
  categoryValues: categories.map((category) => category.value),
};
