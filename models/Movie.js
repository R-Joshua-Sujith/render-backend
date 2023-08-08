const mongoose = require("mongoose");
const MovieSchema = new mongoose.Schema(
    {
        src: { type: String, required: true },
        src2: { type: String },
        name: { type: String, required: true },
        desc: { type: String, required: true },
        rating: { type: String, required: true },
        category: { type: String, required: true },
        category2: { type: String },
        link: { type: String, required: true }
    }
)

const MovieModel = mongoose.model("movies", MovieSchema);

module.exports = MovieModel