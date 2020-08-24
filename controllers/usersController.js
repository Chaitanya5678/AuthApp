
const User = require('../models/user');

const crypto = require('crypto');

module.exports.profile = function(req,res){

    User.findById(req.params.id, function(err,user){

        return res.render('user_profile', {
            title : 'Profile',
            profile_user: user
        });

    });
    
}

module.exports.update = function(req,res)
{
    if(req.user.id == req.params.id)
    {
        User.findByIdAndUpdate(req.params.id, req.body, function(err,user)
        {
            if(err)
            {
                console.log('Error in updating user profile');

                req.flash('error', err);
                return res.redirect('back');
            }

            req.flash('success', 'Update Successful');
            return res.redirect('back');
        });
    }
    else{
        return res.status(401).send('Unauthorised');
    }
}

module.exports.updatePassword = async function(req,res)
{
    if(req.user.id == req.params.id)
    {
        try
        {
            let user = await User.findById(req.params.id);

            if(user.password != crypto.pbkdf2Sync(req.body.current_password, user.salt, 1000, 64, `sha512`).toString(`hex`))
            {
                req.flash('error', 'Invalid Password');
                return res.redirect('back');
            }

            if(req.body.password == req.body.confirm_password)
            {
                user.password = crypto.pbkdf2Sync(req.body.password, user.salt, 1000, 64, `sha512`).toString(`hex`);
                user.save();
                req.flash('success', 'Password Reset Successful');
            }
            else
            {
                req.flash('error', 'Passwords must match');
            }

            return res.redirect('back');
        }
        catch(err)
        {
            req.flash('error', err);
            return res.redirect('back');
        }
    }
    else{
        return res.status(401).send('Unauthorised');
    }
}


module.exports.signUp = function(req,res){

    if(req.isAuthenticated())
    {
        return res.redirect('/');
    }

    return res.render('user_sign_up', {
        title : 'Sign Up'
    });
}

module.exports.signIn = function(req,res){

    if(req.isAuthenticated())
    {
        return res.redirect('/');
    }

    return res.render('user_sign_in', {
        title : 'Sign In'
    });
}

module.exports.create = function(req, res)
{
    if(req.body.password != req.body.confirm_password)
    {
        req.flash('error', 'Passwords must match');
        return res.redirect('back');
    }

    User.findOne({email: req.body.email}, function(err,user)
    {
        if(err){ console.log('Error in signing up'); return;}

        if(!user)
        {
            req.body.salt = crypto.randomBytes(16).toString('hex');
            req.body.password = crypto.pbkdf2Sync(req.body.password, req.body.salt, 1000, 64, `sha512`).toString(`hex`);
            req.body.authMechanism = 'local';

            User.create(req.body, function(err,user){
                if(err){ console.log('Error in creating account while signing up');
                return;}
            });

            req.flash('success', 'Sign Up Successful');


            return res.redirect('/users/sign-in');
        }
        else{

            return res.redirect('back');
        }

    });
}

module.exports.createSession = function(req,res)
{
    req.flash('success', 'Signed In Successfully');

    return res.redirect('/');    
}

module.exports.destroySession = function(req,res)
{
    req.logout();

    req.flash('success', 'You have logged out!');

    return res.redirect('/');
}