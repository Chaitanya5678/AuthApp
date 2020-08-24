const User = require('../models/user');

module.exports.home = function(req,res)
{
    return res.render('home', {
        title : 'Home',
        user: req.user
    }); 
}