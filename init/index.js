const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

Main().then(() =>{
    console.log("connection successful");
}).catch((err) =>{
    console.log(err);
});
async function Main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
 
const initDB = async () => {
  await Listing.deleteMany({});
  initData.data= initData.data.map((obj)=>({...obj, owner:"697867ef8ec247e1275b58e2"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();