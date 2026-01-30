const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
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

//index route
app.get('/Listings', async (req,res) =>{
    let allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
});

//create route
app.get('/Listings/new', (req,res) =>{
    res.render("listings/new.ejs");
});

app.post('/Listings', async (req,res) =>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/Listings');
});

//show route
app.get('/Listings/:id', async (req,res) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//edit route
app.get('/Listings/:id/edit', async (req,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//update route
app.put('/Listings/:id', async (req,res) =>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/Listings/${id}`);
});

//delete route
app.delete('/Listings/:id', async (req,res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/Listings');
});