const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

// ============================
// Application Set Up
// ============================

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
    secret: 'ReplaceMeForSecurity',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ============================
// Database
// ============================

const mongoDB = "mongodb://localhost:27017/auth_app";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

// ============================
// Models
// ============================

const User = require('./models/user');

// ============================
// Auth
// ============================

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// ============================
// Middlewear
// ============================
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
};

// ============================
// Routes
// ============================

// Root
app.get('/', function(req, res){
    res.render('home');
});

// Protected behind Auth end point
app.get('/secret', isLoggedIn, function(req, res){
    res.render('secret');
});

// Auth Routes
// Show register form
app.get('/register', function(req, res){
    res.render('register');
});

// Receive post for registration and create user
app.post('/register', function(req, res){
    User.register(
        new User({username: req.body.username}), 
        req.body.password,
        function(err, result){
            if (err){
                console.log(err);
                return res.render('register');
            } else {
                console.log(result);
            }
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secret');
            });
        });
});

// Show Login Form
app.get('/login', function(req, res){
    res.render('login');
});

// End point to post login info to so we can validate you
app.post("/login", 
passport.authenticate("local"), 
function(req, res){
    res.redirect('/secret')
});

// Logout
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

// ============================
// Start Application
// ============================

app.listen(3000, function(){
    console.log("Server is active on localhost:3000/, API is active on mongodb://localhost:27017/auth_app");
});
