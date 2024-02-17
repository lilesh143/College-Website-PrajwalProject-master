const isAuthorize = async(req, res, next) => {
    try {

        if (!req.headers.authorization ||
            !req.headers.authorization.startsWith('bearer') ||
            !req.headers.authorization.split(' ')[1]
        ) {
            return res.status(422).json({
                msg: 'Please provide token'
            })
        }

        next()


    } catch (error) {
        console.log(error.message);

    }

}

const isLogin = async(req, res, next) => {

    try {

        if (req.session.isLogged) {} else {
            res.redirect('/api/login')
        }
        next();

    } catch (error) {
        console.log(error.message);
    }

}

const isLogout = async(req, res, next) => {
    try {

        if (req.session.isLogged) {
            res.redirect('/api/login/home')
        }

        next();

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isAuthorize,
    isLogin,
    isLogout
}