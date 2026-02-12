if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError"); 
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter=require("./routes/listing");
const reviewRouter=require("./routes/review");
const userRouter=require("./routes/user");

const atlasDB_URL=process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate); 
app.use(express.static(path.join(__dirname,"/public")));

Main().then(() =>{
    console.log("connection successful");
}).catch((err) =>{
    console.log(err);
});
async function Main() {
    await mongoose.connect(atlasDB_URL);
}

const store=MongoStore.create({
    mongoUrl: atlasDB_URL,
    crypto: {
      secret: process.env.SECRET,
    },
    touchAfter:24*60*60,
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e);
})

const sessionOptions={
 store:store,
 secret:process.env.SECRET,
 resave:false,
 saveUninitialized:true,
 cookie:{
    httpOnly:true,
    expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge:1000 * 60 * 60 * 24 * 7
 }
};

// app.get("/",(req,res)=>{
//     res.send("Hi, i am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next(); 
})

// app.get("/demouser",async(req,res)=>{
//     fakeUser=new User({
//       email:"sonu@gmail.com",
//       username:"sonu"
//     });
//     let registeruser= await User.register(fakeUser,"sonu-kumar");
//     res.send(registeruser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// // //  it is work as middleware when route is not found
app.use((req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

// // // middleware (handling errors by next)
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});  

app.listen(8010,()=>{
    console.log("Server is running on port 8010");
});
