const User = require('../models/user');

module.exports.home = function(req,res)
{
    return res.render('home', {
        title : 'Home',
        profile_user: req.user
    }); 
}