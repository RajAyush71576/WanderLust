const Listing = require('../models/listing.js');

module.exports.index = async (req,res) => {
    let allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}

module.exports.renderNewForm = (req,res) =>{
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req,res,next) => {

    if (req.body.listing.image) {
        if (req.body.listing.image.url === "") {
            req.body.listing.image.url = undefined;
        }
        if (req.body.listing.image.filename === "") {
            req.body.listing.image.filename = undefined;
        }
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created !");
    res.redirect('/Listings');
}

module.exports.showListing = async (req,res,next) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.renderEditForm = async (req,res,next) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}

module.exports.updateListing = async (req,res) =>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    req.flash("success", "Listing Updated !");
    res.redirect(`/Listings/${id}`);
}

module.exports.destroyListing = async (req,res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect('/Listings');
}