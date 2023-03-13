/*********************************************************************************
 *  WEB322 – Assignment 05
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Shubpreet Kaur    Student ID: 161155213    Date:
 *
 *  Online (Cyclic) Link: https://blue-expensive-penguin.cyclic.app/about
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
} = require("./blog-service");

app.use(express.static("public")); // serve static files

app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req, res) => {
  res.render("about");
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
    let post = await getPostById(req.params.id);
    viewData.post = post[0];
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

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
  // res.send(viewData)
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

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.post("/posts/add", uploadFile.single("featureImage"), (req, res) => {
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

app.get("/posts/add", async (req, res) => {
  try {
    let data = await getCategories();
    res.render("addPost", { categories: data });
  } catch (e) {
    res.render("addPost", { categories: [] });
  }
});

app.get("/posts", async (req, res) => {
  if (req.query.category) {
    try {
      let data = await getPostsByCategory(req.query.category);
      if (data.length > 0) {
        res.render("posts", { posts: data });
      } else {
        res.render("posts", { message: "no results" });
      }
    } catch (e) {
      res.render("posts", { message: "no results" });
    }
  } else if (req.query.minDate) {
    try {
      let data = await getPostsByMinDate(req.query.minDate);
      if (data.length > 0) {
        res.render("posts", { posts: data });
      } else {
        res.render("posts", { message: "no results" });
      }
    } catch (e) {
      res.render("posts", { message: "no results" });
    }
  } else {
    try {
      let data = await getAllPosts();
      if (data.length > 0) {
        res.render("posts", { posts: data });
      } else {
        res.render("posts", { message: "no results" });
      }
    } catch (e) {
      res.render("posts", { message: "no results" });
    }
  }
});

app.get("/post/:id", async (req, res) => {
  try {
    let post = await getPostById(req.params.id);
    res.send(post[0]);
  } catch (e) {
    res.json({ message: e });
  }
});

app.get("/posts/delete/:id", async (req, res) => {
  let id = req.params.id;
  deletePostById(id)
    .then(() => res.redirect("/posts"))
    .catch((e) =>
      res.status(500).send("Unable To Remove Post / Post not found")
    );
});

app.get("/categories/add", async (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", async (req, res) => {
  addCategory(req.body)
    .then(() => res.redirect("/categories"))
    .catch((e) => console.log(e));
});

app.get("/categories/delete/:id", async (req, res) => {
  let id = req.params.id;
  deleteCategoryById(id)
    .then(() => res.redirect("/categories"))
    .catch((e) =>
      res.status(500).send("Unable To Remove Category / Category not found")
    );
});

app.get("/categories", async (req, res) => {
  try {
    let data = await getCategories();
    // res.render("categories", { categories: data });
    if (data.length > 0) {
      res.render("categories", { categories: data });
    } else {
      res.render("categories", { message: "no results" });
    }
  } catch (e) {
    res.render("categories", { message: "no results" });
  }
});

app.use((req, res) => {
  res.render("404", { title: "404 | Page Not Found" });
});

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

initialize
  .then((data) => {
    if (data === "success") {
      app.listen(HTTP_PORT, onHttpStart); // setup http server to listen on HTTP_PORT
    }
  })
  .catch((e) => {
    console.log(e);
  });
