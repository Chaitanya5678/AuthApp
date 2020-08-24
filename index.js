const express = require('express');

const cookieParser = require('cookie-parser');

const port = 8080;

const app = express();

const expressLayouts = require('express-ejs-layouts');

const db = require('./config/mongoose');

//used for session cookie
const session = require('express-session');
const passport = require('passport');

const passportLocal = require('./config/passport-local-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

//using mongo store as persistent storage of session cookies
const mongoStore = require('connect-mongo')(session);

//set up flash messages
const flash = require('connect-flash');
const customMWare = require('./config/middleware');

//handling post request data and cookies
app.use(express.urlencoded());
app.use(cookieParser());

//extract styles and scripts from subpages into layout
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//set up path to static files
app.use(express.static('./assets'));

//set up view engine and path to views
app.set('view engine', 'ejs');
app.set('views', './views');


//set up for session cookies using passport and express-session
app.use(session({
    
    name: 'AuthApp',
    secret: '4742DF7C9E979FAD52C8538838A68', // Generated using randomkeygen.com
    saveUninitialized: false,
    resave: false,
    cookie:{
        maxAge: (1000*60*100)
    },
    store: new mongoStore({
        mongooseConnection : db,
        autoRemove: 'disabled'
    },
    function(err)
    {
        console.log(err || 'connection to mongo-db set up ok');
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMWare.setFlash);

//use express route
app.use('/',require('./routes'));

app.listen(port, function(err){
    if(err)
    {
        console.log('Error in firing up server ', err);
        return;
    }

    console.log('Server is Up and running on port : ', port);
});