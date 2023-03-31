/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party websites) or distributed to other students.
 *
 *  Name: Shubpreet Kaur    Student ID: 161155213    Date: 31-03-2023
 *
 *  Online (Cyclic) Link: https://blue-expensive-penguin.cyclic.app/
 *
 ********************************************************************************/

// setup our requires
let HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const stripJs = require("strip-js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const clientSessions = require("client-sessions");

/*
 Cloudinary Configuration
*/
cloudinary.config({
    cloud_name: "dxa0rpkv2",
    api_key: "222988455762491",
    api_secret: "yY6CD52eGzQ4E6Z4CaL4W0DtEq8",
    secure: true,
});

let uploadFile = multer();

const {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getPublishedPostsByCategory,
    addPost,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById,
    deletePostById,
    addCategory,
    getCategories,
    deleteCategoryById,
} = require("./blog-service"); // module

const authData = require("./auth-service"); // module

/*
    Setup client-sessions
*/
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(express.static("public")); // Serve static files...

app.use(express.urlencoded({extended: false})); // Parse application/x-www-form-urlencoded...

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute =
        "/" +
        (isNaN(route.split("/")[1])
            ? route.replace(/\/(?!.*)/, "")
            : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Register handlebars as the rendering engine for views
app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: __dirname + "/views/layouts/",
        helpers: {
            navLink: function (url, options) {
                return (
                    "<li" +
                    (url == app.locals.activeRoute ? ' class="active" ' : "") +
                    '><a href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    "</a></li>"
                );
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            },
            safeHTML: function (context) {
                return stripJs(context);
            },
            formatDate: function (dateObj) {
                let year = dateObj.getFullYear();
                let month = (dateObj.getMonth() + 1).toString();
                let day = dateObj.getDate().toString();
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            },
        },
    })
);
app.set("view engine", "hbs");

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

/* Assignment 6 Code [start] */
app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then(user => {
        /* Add the user on the session and redirect them to the dashboard page. */
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect("/posts");
    }).catch(e => {
        res.render("login", {errorMessage: e, userName: req.body.userName});
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", (req, res) => {
    authData.userRegister(req.body).then(data => {
        res.render("register", {successMessage: "User created"});
    }).catch(e => {
        res.render("register", {errorMessage: e, userName: req.body.userName});
    });
});

app.get("/register", (req, res) => {
    res.render("register");
});
/* Assignment 6 Code [end] */

app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get("/about", (req, res) => {
    res.render("about", {loggedIn: false});
});

app.get("/blog/:id", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post =  await getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("blog", {data: viewData});  // render the "blog" view with all of the data (viewData)
});

app.get("/blog", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("blog", {data: viewData, loggedIn: false}); // render the "blog" view with all of the data (viewData)
});

app.post("/posts/add", ensureLogin, uploadFile.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req, res) {
        let result = await streamUpload(req);
        return result;
    }

    /* ----------- */
    upload(req).then(async (uploaded) => {
        try {
            req.body.featureImage = uploaded.url;
            await addPost(req.body);
            await res.redirect("/posts");
        } catch (e) {
            console.log(e);
        }
    });
    /* ----------- */
});

app.get("/posts/add", ensureLogin, async (req, res) => {
    try {
        let data = await getCategories();
        res.render("addPost", {categories: data});
    } catch (e) {
        res.render("addPost", {categories: []});
    }
});

app.get("/posts", ensureLogin, async (req, res) => {
    if (req.query.category) {
        try {
            let data = await getPostsByCategory(req.query.category);
            if (data.length > 0) {
                res.render("posts", {posts: data, loggedIn: true});
            } else {
                res.render("posts", {message: "no results", loggedIn: true});
            }
        } catch (e) {
            res.render("posts", {message: "no results", loggedIn: true});
        }
    } else if (req.query.minDate) {
        try {
            let data = await getPostsByMinDate(req.query.minDate);
            if (data.length > 0) {
                res.render("posts", {posts: data, loggedIn: true});
            } else {
                res.render("posts", {message: "no results", loggedIn: true});
            }
        } catch (e) {
            res.render("posts", {message: "no results", loggedIn: true});
        }
    } else {
        try {
            let data = await getAllPosts();
            if (data.length > 0) {
                res.render("posts", {posts: data, loggedIn: true});
            } else {
                res.render("posts", {message: "no results", loggedIn: true});
            }
        } catch (e) {
            res.render("posts", {message: "no results", loggedIn: true});
        }
    }
});

app.get("/post/:id", ensureLogin, async (req, res) => {
    try {
        let post = await getPostById(req.params.id);
        res.send(post[0]);
    } catch (e) {
        res.json({message: e});
    }
});

app.get("/posts/delete/:id", ensureLogin, async (req, res) => {
    let id = req.params.id;
    deletePostById(id)
        .then(() => res.redirect("/posts"))
        .catch((e) =>
            res.status(500).send("Unable To Remove Post / Post not found")
        );
});

app.get("/categories/add", ensureLogin, async (req, res) => {
    res.render("addCategory");
});

app.post("/categories/add", ensureLogin, async (req, res) => {
    addCategory(req.body)
        .then(() => res.redirect("/categories"))
        .catch((e) => console.log(e));
});

app.get("/categories/delete/:id", ensureLogin, async (req, res) => {
    let id = req.params.id;
    deleteCategoryById(id)
        .then(() => res.redirect("/categories"))
        .catch((e) =>
            res.status(500).send("Unable To Remove Category / Category not found")
        );
});

app.get("/categories", ensureLogin, async (req, res) => {
    try {
        let data = await getCategories();
        // res.render("categories", { categories: data });
        if (data.length > 0) {
            res.render("categories", {categories: data});
        } else {
            res.render("categories", {message: "no results"});
        }
    } catch (e) {
        res.render("categories", {message: "no results"});
    }
});

app.use((req, res) => {
    res.render("404", {title: "404 | Page Not Found"});
});

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

initialize()
    .then(authData.initialize)
    .then(function (response) {
        console.log(response);
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
    console.log("unable to start server: " + err);
});
