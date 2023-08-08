const MovieModel = require("../models/Movie.js")
const router = require("express").Router();

router.get("/", async (req, res) => {
    res.send("Movie Backend")
})


router.get("/getMovies", async (req, res) => {
    try {
        const users = await MovieModel.find();
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

router.get("/topMovies", async (req, res) => {
    try {
        const movies = await MovieModel.find({ category2: 'top' });
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json(err);
    }
})



router.post("/addMovie", async (req, res) => {
    const newMovie = new MovieModel({
        src: req.body.src,
        src2: req.body.src2,
        name: req.body.name,
        desc: req.body.desc,
        rating: req.body.rating,
        category: req.body.category,
        category2: req.body.category2,
        link: req.body.link
    });

    try {
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.get("/movie/:id", async (req, res) => {
    try {
        const movie = await MovieModel.findById(req.params.id);
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete("/deleteMovie/:id", async (req, res) => {
    try {
        await MovieModel.findByIdAndDelete(req.params.id);
        res.status(200).json("Delete Movie");
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put("/editMovie/:id", async (req, res) => {
    try {
        const updatedMovie = await MovieModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedMovie);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;