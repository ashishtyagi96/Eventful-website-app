/**
 * Created by ashishtyagi9622 on 27/9/17.
 */
var express = require('express'),
    exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter'),
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook');
var path = require('path');
var config = require('./config.js');
var funct = require('./functions.js');
var app = express();
var stripe=require('stripe')('your stripe API key');   // enter your stripe API key for payment
var bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));



var apiai = require('apiai');

var apiAi = apiai("Enter your API.ai API key");       // enter your api.ai key here for chatbot



// app.use('/',express.static('views'));
// app.get('/',function (req,res) {
//    res.sendFile('index.html');
// });

//===============PASSPORT=================
// Use the LocalStrategy within Passport to login/"signin" users.
passport.use('local-signin', new LocalStrategy(
    {passReqToCallback : true}, //allows us to pass back the request to the callback
    function(req, username,password,done) {
        funct.localAuth(username, password,req.body.first_name,req.body.last_name)
            .then(function (user) {
                if (user) {

                    console.log("LOGGED IN AS: " + user.username);
                    req.session.success = 'You are successfully logged in ' + user.username + '!';
                    done(null, user);
                }
                if (!user) {
                    console.log("COULD NOT LOG IN");
                    req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
                    done(null, user);
                }
            })
            .fail(function (err){
                console.log(err.body);
            });
    }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
    {passReqToCallback : true}, //allows us to pass back the request to the callback
    function(req, username, password,done) {
        funct.localReg(username, password,req.body.first_name,req.body.last_name)
            .then(function (user) {
                if (user) {
                    console.log("REGISTERED: " + user.username);
                    req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
                    done(null, user);
                }
                if (!user) {
                    console.log("COULD NOT REGISTER");
                    req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
                    done(null, user);
                }
            })
            .fail(function (err){
                console.log(err.body);
            });
    }
));


// Passport session setup.
passport.serializeUser(function(user, done) {
    console.log("serializing " + user.username);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log("deserializing " + obj);
    done(null, obj);
});



// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.error = 'Please sign in!';
    res.redirect('/signin');
}
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
    var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});
// Configure express to use handlebars templates
// var hbs = exphbs.create({
//         defaultLayout: 'main' //we will be creating this layout shortly
// });

//app.engine('handlebars', exphbs({defaultLayout: 'main', extname: '.handlebars', layoutsDir: './views/layouts'}));

app.engine('handlebars', exphbs({extname: '.handlebars', layoutsDir: './views/layouts'}));

app.set('view engine','handlebars');
app.set('views',path.join(__dirname,"./views/layouts"));
app.use(express.static(path.join(__dirname,'/views/layouts')));

// app.use(express.static(path.join(__dirname, '/public_static')));
//===============ROUTES=================
//
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

//displays our homepage
app.get('/', function(req, res){

    if(req.user){
        funct.updating_upcoming(req.user.username);
    }

    res.render('main', {user: req.user});
});
// app.get('/account',function (req,res) {
//     res.render('account',{user:req.user});
// });
//displays our signup page
app.get('/signin', function(req, res){
    res.render('signin');
});

//for sending location
app.post('/loca',function(req,res){
    funct.location_search(req.body,function (data) {
        res.send(data);
    });
});
app.get('/account',function (req,res) {
    res.render('account',{user:req.user});
});
app.get('/contact',function (req,res) {
    res.render('contact_info',{user:req.user})
});
app.get('/password',function (req,res) {
    res.render('password',{user:req.user})
});
app.get('/socialSettings',function (req,res) {
    res.render('social_Settings',{user:req.user})
});
app.get('/closeAccount',function (req,res) {
    res.render('close_Account',{user:req.user})
});
app.get('/payout',function (req,res) {
    res.render('payout',{user:req.user})
});
app.get('/invoice',function (req,res) {
    res.render('invoice',{user:req.user})
});
app.get('/saved',function (req,res) {
    funct.get_user(req.user.username,function (data) {
        res.render('saved',{user:data});
    });
});
app.get('/browse',function (req,res) {
    res.render('browse',{user:req.user});
});
//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup.html'
    })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
        successRedirect: '/',
        failureRedirect: '/login.html'
    })

);

app.post('/charge',function (req,res) {
    var token=req.body.stripeToken;
    console.log(req.body);

    var email=req.body.stripeEmail;
    var chargeAmount=(req.body.amount_a)*100;
    var charge=stripe.charges.create({
        amount:chargeAmount,
        currency:"inr",
        source:token,
        metadata:{
            "img":req.body.img,
            "name":req.body.name,
            "time":req.body.time,
            "location":req.body.location,
            "number_of_tickets":req.body.number_tickets
        }
    },function (err,charge) {
        if(err){
            console.log(err.message,"Your card was declined");
        }
        else{
            console.log("Your payment was successful");
            console.log(charge);
            // funct.adding_bought_event(req.user.username,charge);
            funct.adding_payment(req.user.username,charge);
            res.redirect('/');
        }

    });


});

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
    var name = req.user.username;
    console.log("LOGGIN OUT " + req.user.username);
    req.logout();
    res.redirect('/');
    req.session.notice = "You have successfully been logged out " + name + "!";
});

app.post('/deactivate',function (req,res) {

    funct.delete_acc(req.user.username);
    res.redirect('/logout');

});
// app.post('/deactivate',function (req,res) {
//     var name = req.user.username;
//     console.log("LOGGIN OUT " + req.user.username);
//     req.logout();
//     funct.delete_acc(req.user.username); /* function likhna hai abhi*/
//     res.redirect('/');
//     req.session.notice = "You have successfully been logged out " + name + "!";
// });
app.post('/saved',function (req,res) {
    if(!req.user){
        res.send("no user logged in");
    }
    else{
        funct.saving(req.body,req.user.username);
        res.send("saved");
    }
});
app.post('/unsaved',function (req,res) {
    funct.unsaving(req.body,req.user.username);
    res.send("unsaved");
});


app.post('/searching',function (req,res) {
    console.log(req.body);
    var q=req.body.q;
    var loc=req.body.loc;
    var dat=req.body.dat;
    // console.log(q);
    // console.log(loc);
    // console.log(dat);
    // var s_name=q.split(' ');
    var s_loc=loc.split(',');
    // console.log(s_name);
    // console.log(s_loc);
    funct.searching_events(q,loc,dat,function (data) {
        console.log(data);
        res.send(data);
    });
});

app.post("/askFaq",function(req,res){
    var request = apiAi.textRequest(req.body.ques, {
        sessionId: '123123'
    });
    request.on('response', function(response) {
        console.log("server:",response.result.fulfillment.speech);
        res.json({
            answer:response.result.fulfillment.speech
        });
    });

    request.on('error', function(error) {
        console.log(error);
        res.send(error);
    });
    request.end();
});
app.post('/contact_info',function (req,res) {
    console.log(req.body);
    funct.saving_details(req.user.username,req.body);
    res.redirect('contact');
});
app.post('/change_email',function (req,res) {
    funct.change_email(req.user.username,req.body);
    res.redirect('/logout');
});
// app.get('/create_event',function (req,res) {
//     res.render('create')
// });
app.get('/forgot_pssword',function (req,res) {

});
app.post('/change_password',function (req,res) {
    funct.change_password(req.user.username,req.body.enter);
    res.redirect('/logout');
});

//===============PORT=================
var port = process.env.PORT || 3000; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");

