const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');

// While creating credentials in console.developers.google.com, Use following 
//Authorised JavaScript origins -- > http://localhost:8080
// Authorised redirect URIs -- > http://localhost:8080/users/auth/google/callback

passport.use(new googleStrategy({

        // These are dummy credentials. Use your own credentials

        clientID: 'fddfafase-fdfdfddf.apps.googleusercontent.com',
        clientSecret: 'dfasdfasdfg',
        callbackURL: 'http://localhost:8080/users/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done){

        User.findOne({email: profile.emails[0].value}).exec(function(err,user){

            if(err)
            {
                console.log('Error in Google Strategy Passport', err);
                return;
            }

            if(user)
            {
                return done(null,user);
            }
            else
            {
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex'),
                    salt: 'google',
                    authMechanism: 'google'
                },
                
                function(err,user){

                    if(err)
                    {
                        console.log('Error in creating account for Google Strategy Passport', err);
                        return;
                    }

                    return done(null,user);

                });
            }
        });

    }
));

module.exports = passport;