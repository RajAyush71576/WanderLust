const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');

const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

const port = 3000;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

let MONGOOSE_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
    console.log("connection successful");
}).catch((err) =>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGOOSE_URL);
}

app.listen(port, (req,res) =>{
    console.log(`app is working on port${port}`);
});

app.get('/', (req,res) =>{
    res.send("root is started");
});

app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

//Error handeler
app.use((req,res,next) =>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
    // res.status(statusCode).send(message);
});