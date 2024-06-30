const express = require('express');
const user_route = express();
const path = require('path');

// user_route.set('view engine', 'ejs');
user_route.set('views', './views');
// user_route.use(express.static(__dirname));

const userController = require('../controllers/userController')
    // const auth = require('../middleware/auth')

user_route.get('/', userController.home);
// user_route.get('/admission', userController.admission);
user_route.get('/admin', userController.admin)
user_route.get('/learning', userController.learning)
user_route.get('/course', userController.course)
user_route.get('/events', userController.events);
user_route.get('/gallery', userController.gallery);
user_route.get('/profile', userController.profile);
user_route.get('/addDetails', userController.addDetails);
// user_route.get('/profile/addDetials', userController.addDetails);
// user_route.get('/api/login', userController.login2);
// user_route.get('/contact', userController.contact);



user_route.get('/mail-verification', userController.verifyMail);
user_route.get('/reset-password', userController.resetPasswordLoad);
user_route.post('/reset-password', userController.resetPassword);
user_route.post('/addDetaIls', userController.addInfo);

module.exports = user_route;