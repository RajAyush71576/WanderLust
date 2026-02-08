const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema } = require('./schema.js');

const port = 3000;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");s
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

const validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//index route
app.get('/Listings', wrapAsync(async (req,res) =>{
    let allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
    })
);

//create route
app.get('/Listings/new', (req,res) =>{
    res.render("listings/new.ejs");
});

app.post('/Listings', validateListing, wrapAsync(async (req,res,next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/Listings');
    })
);

//show route
app.get('/Listings/:id', wrapAsync(async (req,res,next) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    res.render("listings/show.ejs", { listing });
    })
);

//edit route
app.get('/Listings/:id/edit', wrapAsync(async (req,res,next) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    res.render("listings/edit.ejs", { listing });
    })
);

//update route
app.put('/Listings/:id', validateListing, wrapAsync(async (req,res) =>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    res.redirect(`/Listings/${id}`);
    })
);

//delete route
app.delete('/Listings/:id', wrapAsync(async (req,res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/Listings');
    })
);

//Error handeler
app.use((req,res,next) =>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
    // res.status(statusCode).send(message);
});