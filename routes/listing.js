const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');

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
router.get('/', wrapAsync(async (req,res) =>{
    let allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
    })
);

//create route
router.get('/new', (req,res) =>{
    res.render("listings/new.ejs");
});

router.post('/', validateListing, wrapAsync(async (req,res,next) => {

    if (req.body.listing.image) {
        if (req.body.listing.image.url === "") {
            req.body.listing.image.url = undefined;
        }
        if (req.body.listing.image.filename === "") {
            req.body.listing.image.filename = undefined;
        }
    }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created !");
    res.redirect('/Listings');
    })
);

//show route
router.get('/:id', wrapAsync(async (req,res,next) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
    })
);

//edit route
router.get('/:id/edit', wrapAsync(async (req,res,next) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
    })
);

//update route
router.put('/:id', validateListing, wrapAsync(async (req,res) =>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    req.flash("success", "Listing Updated !");
    res.redirect(`/Listings/${id}`);
    })
);

//delete route
router.delete('/:id', wrapAsync(async (req,res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect('/Listings');
    })
);

module.exports = router;