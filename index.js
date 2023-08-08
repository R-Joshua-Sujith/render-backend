const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")
const cron = require('node-cron');
const axios = require('axios')

const authRoute = require("./routes/authentication")
const movieRoute = require("./routes/movie")
const ecommerceRoute = require("./routes/ecommerce")

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connection Successful"))
    .catch((err) => console.log(err))

app.get('/', (req, res) => {
    res.send("Main Backend")
})


app.get('/scheduled-api', (req, res) => {
    // Make the API request to your endpoint
    axios.get('https://maindatabase-joshua14.onrender.com/')
        .then(response => {
            console.log(response.data);
            res.send('API request sent successfully');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Failed to send API request');
        });
});

cron.schedule('*/10 * * * *', () => {
    axios.get('http://localhost:5000/scheduled-api')
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
});



app.use("/auth", authRoute);
app.use("/movieAPI", movieRoute);
app.use("/ecomAPI", ecommerceRoute);

app.listen(5000, () => {
    console.log("Backend server is running!");
});
