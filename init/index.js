const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initData = require('./data.js');

let MONGOOSE_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
    console.log("connection successful");
}).catch((err) =>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGOOSE_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"69aaa7c8a6812b1ed960c899"}));
    await Listing.insertMany(initData.data);
    console.log("data is saved");
}

initDB();