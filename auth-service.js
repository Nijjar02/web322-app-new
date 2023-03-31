/* -- MongoDB -- */
// require mongoose and setup the Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const url = "mongodb+srv://shubpreet:lhzbV5SOR1zv5OGk@senecaweb.ak8lqjc.mongodb.net/web322_week8?retryWrites=true&w=majority";

// define the user schema
let userSchema = new Schema({
    userName: {
        type: String,
        // required: true,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }],
});

let User;

/* Create Connection... */
module.exports.initialize = () => {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(url);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve('Connected to the database');
        });
    })
}

/* User Registration... */
module.exports.userRegister = (userData) => {
    return new Promise(function (resolve, reject) {
        let {userName, password, password2, email} = userData;
        if (!userName || !password || !password2 || !email) {
            return reject("All fields are required");
        }
        if (password !== password2) {
            return reject("Passwords do not match");
        }

        bcrypt.hash(password, 10).then(hash => {
            userData.password = hash;
            let newUser = new User(userData);
            newUser.save().then(() => {
                resolve();
            }).catch(err => {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject(`There was an error creating the user: ${err}`);
                }
            });
        }).catch(err => {
            reject("There was an error encrypting the password");
        });
    });
}

/* User Login... */
module.exports.checkUser = (userData) => {
    return new Promise(function (resolve, reject) {
        let {userName, password} = userData;
        if (!userName || !password) {
            return reject("Missing credentials.");
        }

        User.find({userName: userName}).exec().then(user => {
            if (user.length === 0) {
                return reject(`Unable to find user: ${userName}`);
            }
            bcrypt.compare(password, user[0].password).then((result) => {
                if(!result) {
                    return reject(`Incorrect Password for user: ${userName}`);
                }
                user[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.updateOne(
                    {userName: user[0].userName},
                    {$set: {loginHistory: user[0].loginHistory}}
                ).exec().then(() => {
                    resolve(user[0]);
                }).catch(error => {
                    reject(`There was an error verifying the user: ${error}`);
                });
            }).catch(e => {
                reject(`There was an error verifying the user: ${e}`);
            });
        }).catch(e => {
            reject(`Unable to find user: ${userName}`);
        });
    });
}