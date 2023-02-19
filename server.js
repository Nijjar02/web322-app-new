/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Shubpreet Kaur    Student ID: 161155213    Date: 2023-02-19
 *
 *  Online (Cyclic) Link: https://blue-expensive-penguin.cyclic.app/about
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cloudinary Configuration
cloudinary.config({
    cloud_name: "dbvsitudb",
    api_key: "142634479741447",
    api_secret: "gkNGA_sushC7Cv73XnP15sEB0FU",
    secure: true,
});

var uploadFile = multer();

const {
    initialize,
    getAllPosts,
    getCategories,
    getPublishedPosts,
    addPost,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById
} = require("./blog-service");

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/blog", (req, res) => {
    getPublishedPosts
        .then((data) => {
            let publishedPosts = data.flat().filter((x) => x.published === true);
            res.send(publishedPosts);
        })
        .catch((e) => {
            res.json({message: e});
        });
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
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        addPost(req.body)
            .then((data) => {
                res.redirect("/posts");
            })
            .catch((e) => {
                console.log(e);
            });
    });
    /* ----------- */
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views/addPost.html"));
});

app.get("/posts", (req, res) => {
    if (req.query.category !== undefined) {
        getPostsByCategory(req.query.category).then(data => {
            res.send(data);
        }).catch(e => {
            res.json({message: e});
        })
    } else if (req.query.minDate !== undefined) {
        getPostsByMinDate(req.query.minDate).then(data => {
            res.send(data);
        }).catch(e => {
            res.json({message: e});
        })
    } else {
        getAllPosts
            .then((data) => {
                res.send(data.flat());
            })
            .catch((e) => {
                res.json({message: e});
            });
    }
});

app.get('/post/:id', (req, res) => {
    getPostById(req.params.id).then(data => {
        res.send(data[0]);
    }).catch(e => {
        res.json({message: e});
    })
})

app.get("/categories", (req, res) => {
    getCategories
        .then((data) => {
            res.send(data.flat());
        })
        .catch((e) => {
            res.json({message: e});
        });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "views/pageNotFound.html"));
});

initialize
    .then((data) => {
        if (data === "success") {
            app.listen(process.env.POST || 8080, () => {
                console.log(`Express http server listening on port 8080`);
            });
        }
    })
    .catch((e) => {
        console.log(e);
    });
