const { validationResult } = require('express-validator');
const db = require('../config/dbConnection');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const path = require('path');
const session = require('express-session');


const { isAthorize } = require('../middleware/auth');

const register = (req, res) => {

    console.log(req.body.fName);
    console.log(req.body.email);
    console.log(req.body.password);
    console.log(req.file.filename);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    db.query(
        `SELECT * FROM users2 WHERE LOWER(email) = LOWER($1);`, [req.body.email],
        (err, result) => {
            console.log(result.rows.length);


            if (result.rows.length && result != undefined) {

                // req.flash('info', 'This user already exist')\
                // req.flash('info', 'This user already exists')
                // res.redirect('/api/sign_up')

                return res.status(409).send({
                    msg: 'This user already exists',
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(400).send({
                            msg: err,
                        });
                    } else {
                        db.query(
                            `INSERT INTO users2 (name, email, password, image) VALUES ($1, $2, $3, $4);`, [req.body.fName, req.body.email, hash, req.file.filename],
                            (err, result) => {
                                if (err) {
                                    return res.status(400).send({
                                        msg: err,
                                    });
                                }

                                const randomToken = randomstring.generate();

                                let mailSubject = 'Mail Verification';
                                let content = `<p> Hii ${req.body.name}, Please <a href="http://127.0.0.1:3000/mail-verification?token=${randomToken}"> Verify</a> your Mail! </p> `;

                                sendMail(req.body.email, mailSubject, content);

                                db.query(
                                    'UPDATE users2 SET token=$1 WHERE email=$2', [randomToken, req.body.email],
                                    (error, result) => {
                                        if (error) {
                                            return res.status(400).send({
                                                msg: error,
                                            });
                                        }
                                        // res.render('login', { msg: 'user register successfully, please login to continue' });

                                        req.flash('msg', 'user register successfully, please login to continue');
                                        res.redirect('/api/login');

                                    }
                                );
                            }
                        );
                    }
                });
            }
        }
    );
};

const verifyMail = (req, res) => {
    var token = req.query.token;

    db.query(
        `SELECT * FROM users2 WHERE token=$1`, [token],
        (error, result, fields) => {
            if (error) {
                console.log(error.message);
            }
            // console.log(token);
            // console.log(result.rows);
            // console.log(result.rows.length);
            // console.log([result].length);
            // console.log([result]);
            // console.log('...........................');
            // console.log([result][0]);

            if (result.rows.length > 0) {
                db.query(
                    `UPDATE users2 SET token = null, is_verified = 1 WHERE id = $1`, [result.rows[0].id]
                );
                return res.render('mail-verification', {
                    message: 'Mail verified successfully',
                });
            } else {
                return res.render('404');
            }
        }
    );
};

const login = (req, res) => {

    // console.log(req.body.email);
    // console.log(req.body.password);


    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    db.query(
        `SELECT * FROM users2 WHERE LOWER(email) = LOWER($1);`, [req.body.email],
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    msg: err,
                });
            }

            if (!result.rows.length) {

                return res.render('login', { msg: 'Email or password is incorrect' })

            }

            bcrypt.compare(
                req.body.password,
                result.rows[0]['password'],
                (bErr, bResult) => {
                    if (bErr) {
                        return res.status(400).send({
                            msg: bErr,
                        });
                    }

                    if (bResult) {
                        const jToken = jwt.sign({
                                id: result.rows[0]['id'],
                                is_admin: result.rows[0]['is_admin'],
                            },
                            JWT_SECRET, { expiresIn: '1h' }
                        );
                        db.query(
                            'UPDATE users2 SET last_login = now() WHERE id=$1', [result.rows[0]['id']],
                            () => {
                                console.log({
                                    msg: 'User Logged in successfully',
                                    jtoken: jToken,
                                    user: [result]['rows'],
                                });

                                console.log(result.rows[0]['id']);

                                var is_admin = result.rows[0]['is_admin']
                                req.session.user_id = result.rows[0]['id'];
                                req.session.userName = result.rows[0]['name'];
                                req.session.isLogged = true;
                                req.session.isAdmin = is_admin;
                                console.log(req.session.user_id);
                                console.log(req.session.isLogged);
                                console.log(req.session.isAdmin);


                                res.render('index', { isLogged: req.session.isLogged, userName: req.session.userName, isAdmin: req.session.isAdmin })


                            }
                        );
                    } else {
                        res.render('login', { msg: 'Email or password is incorrect' })

                    }
                }
            );
        }
    );
};

const getUser = (req, res) => {
    const authToken = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(authToken, JWT_SECRET);

    db.query('SELECT * FROM users2 WHERE id=$1', [decode.id], (err, result) => {
        if (err) throw err;

        return res.status(200).send({
            success: true,
            data: result.rows[0],
            msg: 'User Fetch Successfully',
        });
    });
};

const forgetPassword = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;

    db.query(
        'SELECT * FROM users2 WHERE email=$1 LIMIT 1', [email],
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    msg: err,
                });
            }

            if (result.rows.length > 0) {
                const mailSubject = 'Forget Password';
                const randomString = randomstring.generate();
                const content = `<p> Hii ${result.rows[0].name}, Please Click <a href="http://localhost:3000/reset-password?token=${randomString}"> Here </a> to Reset Password </p>`;

                sendMail(email, mailSubject, content);

                db.query('DELETE FROM password_reset WHERE email=$1', [result.rows[0].email])
                db.query('INSERT INTO password_reset (email, token) VALUES($1, $2)', [result.rows[0].email, randomString],
                    () => {
                        return res.status(200).send({
                            msg: 'Reset Mail sent Successfully',
                        });
                    }
                );
            } else {
                return res.status(401).send({
                    msg: 'Email does not exist',
                });
            }
        }
    );
};

const resetPasswordLoad = (req, res) => {
    try {
        const token = req.query.token;
        if (token == undefined) {
            return res.render('404');
        }

        db.query(
            'SELECT * FROM password_reset WHERE token=$1 LIMIT 1', [token],
            (error, result) => {
                if (error) {
                    console.log(error.message);
                }

                if (result !== undefined && result.rows.length > 0) {
                    db.query(
                        'SELECT * FROM users2 WHERE email=$1 LIMIT 1', [result.rows[0].email],
                        (error, result) => {
                            if (error) {
                                console.log(error.message);
                            }

                            res.render('reset-password', { user: result.rows[0] });
                        }
                    );
                } else {
                    return res.render('404');
                }
            }
        );
    } catch (error) {
        console.log(error.message);
    }
};

const resetPassword = (req, res) => {
    console.log(req.body.user_id, req.body.user_email);

    if (req.body.password != req.body.confirm_password) {
        res.render('reset-password', {
            error_message: 'Password does not match',
            user: { id: req.body.user_id, email: req.body.user_email },
        });
    } else {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.confirm_password, 10, function(err, hash) {
                if (err) {
                    console.log(err);
                } else {
                    db.query(
                        'DELETE FROM password_reset WHERE email=$1', [req.body.user_email],
                        () => {
                            db.query(
                                'UPDATE users2 SET password=$1 WHERE id=$2', [hash, req.body.user_id],
                                () => {
                                    return res.render('updateMsg', {
                                        message: 'Password reset successfully',
                                    });
                                }
                            );
                        }
                    );
                }
            });
        });
    }
};

const updateProfile = (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const authToken = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(authToken, JWT_SECRET);

        var sql = '',
            data;

        if (req.file != undefined) {
            sql = 'UPDATE users2 SET name=$1, email=$2, image=$3 WHERE id=$4';
            data = [
                req.body.name,
                req.body.email,
                req.file.filename,
                decode.id,
            ];
        } else {
            sql = 'UPDATE users2 SET name=$1, email=$2 WHERE id=$3';
            data = [req.body.name, req.body.email, decode.id];
        }

        db.query(sql, data, (error, result) => {
            if (error) {
                res.status(400).send({ msg: error });
            }

            res.status(200).send({
                msg: 'Profile updated successfully',
            });
        });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

const home = (req, res) => {

    res.render('index', { isLogged: req.session.isLogged, userName: req.session.userName, isAdmin: req.session.isAdmin });
}

const admission = (req, res) => {
    // res.sendFile(path.join(__dirname, '../views/Admission_page.html'))
    res.render('Admission_page', {
        msg: req.flash('msg'),
        isLogged: req.session.isLogged,
        userName: req.session.userName,
        isAdmin: req.session.isAdmin
    });

}

const admissionData = async(req, res) => {

    try {
        const checkResult = await db.query(
            `SELECT * FROM admission WHERE LOWER(email) = LOWER($1);`, [req.body.email]
        );

        console.log(checkResult.rows.length);

        if (checkResult.rows.length && checkResult != undefined) {
            req.flash('msg', 'You have already filled the admission form we will contect you shortly');
            res.redirect('/api/admission');
        } else {
            const insertResult = await db.query(
                `INSERT INTO admission (username, email, phone, gender, dob, course) VALUES ($1, $2, $3, $4, $5, $6);`, [req.body.username, req.body.email, req.body.phone, req.body.gender, req.body.dob, req.body.course]
            );

            // const randomToken = generateRandomToken(); // You need to define generateRandomToken function

            // await db.query(
            //     'UPDATE users2 SET token=$1 WHERE email=$2', [randomToken, req.body.email]
            // );

            req.flash('msg', 'Thank you for filling admission form, we will contact you shortly');
            res.redirect('/api/admission');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({
            msg: error.message,
        });
    }
};

const fees = (req, res) => {
    try {
        res.render('fees_page', {
            isLogged: req.session.isLogged,
            userName: req.session.userName,
            isAdmin: req.session.isAdmin
        });

    } catch (error) {
        console.log(error.message);

    }
}

const signUp = (req, res) => {
    // res.sendFile(path.join(__dirname, '../views/Sign_up.html'))
    res.render('Sign_up');
}

const loginPage = (req, res) => {
    // res.sendFile(path.join(__dirname, '../views/Login.html'))
    res.render('Login', { msg: req.flash('msg') });


}

const contact = (req, res) => {
    res.render('Contact_page', {
        msg: req.flash('msg'),
        isLogged: req.session.isLogged,
        userName: req.session.userName,
        isAdmin: req.session.isAdmin
    });
}

const contactData = async(req, res) => {
    const { yourname, emailaddress, phonenumber, message } = req.body;

    try {
        const query = `
      INSERT INTO contact (name, email, phone, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
        const values = [yourname, emailaddress, phonenumber, message];
        const result = await db.query(query, values);

        // Respond with success message or handle appropriately
        // res.status(200).send('Form data submitted successfully!');

        req.flash('msg', 'Thank you for filling the form, we will contact you shortly');
        res.redirect('/api/contact');

    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('An error occurred while submitting the form.');
    }
}

const loadDashboard = async(req, res) => {
    try {
        // let isLogin;
        res.render('index', { isLogged: req.session.isLogged, userName: req.session.userName })
        console.log(req.session.isLogged);
        console.log(req.session);


    } catch (error) {
        console.log(error.message);

    }
}

const logout = async(req, res) => {
    try {
        req.session.destroy(function(error) {
            if (error) {
                console.log(error.message);

            }
        });
        console.log(req.session);
        // req.session.isLogged = false;
        res.redirect('/api/login')
    } catch (error) {
        console.log(error.message);


    }
}

const course = (req, res) => {
    try {
        res.render('course', {
            isLogged: req.session.isLogged,
            userName: req.session.userName,
            isAdmin: req.session.isAdmin
        });

    } catch (error) {
        console.log(error.message);

    }
}

const admin = async(req, res) => {
    try {

        // Query the PostgreSQL database to fetch all admission form data
        const { rows: admissionData } = await db.query('SELECT * FROM admission');

        // Query the PostgreSQL database to fetch all sign up users data
        const { rows: signUpUsers } = await db.query('SELECT * FROM users2');

        // Query the PostgreSQL database to fetch all sign up users data
        const { rows: contactInfo } = await db.query('SELECT * FROM contact');

        // Render the EJS template and pass the data as variables
        res.render('admin', {
            admissionData: admissionData,
            signUpUsers: signUpUsers,
            contactInfo: contactInfo,
            isLogged: req.session.isLogged,
            userName: req.session.userName,
            isAdmin: req.session.isAdmin
        });

        // // Query the PostgreSQL database to fetch all admission form data
        // const { rows } = await db.query('SELECT * FROM admission');

        // // Render the EJS template and pass the admission form data as a variable
        // res.render('admin', { admissionData: rows });
        // console.log({ admissionData: rows });

    } catch (error) {
        console.error('Error fetching admission form data:', error);
        res.status(500).send('Internal Server Error');
    }
}

const learning = async(req, res) => {
    try {
        res.render('learning', {
            isLogged: req.session.isLogged,
            userName: req.session.userName,
            isAdmin: req.session.isAdmin
        });

    } catch (error) {
        console.log(error.message);

    }
}

module.exports = {
    register,
    verifyMail,
    login,
    getUser,
    forgetPassword,
    resetPasswordLoad,
    resetPassword,
    updateProfile,
    home,
    admission,
    admissionData,
    fees,
    signUp,
    loginPage,
    contact,
    loadDashboard,
    logout,
    course,
    admin,
    learning,
    contactData
};