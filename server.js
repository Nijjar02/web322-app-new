const express = require("express");
const path = require("path");
const app = express();
const {initialize, getAllPosts, getCategories, getPublishedPosts} = require("./blog-service");

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/blog", (req, res) => {
    getPublishedPosts.then((data) => {
        let publishedPosts = data.flat().filter(x => x.published === true);
        res.send(publishedPosts);
    }).catch((e) => {
        res.json({message: e});
    });
});

app.get("/posts", (req, res) => {
    getAllPosts.then((data) => {
        res.send(data.flat());
    }).catch((e) => {
        res.json({message: e});
    });
});

app.get("/categories", (req, res) => {
    getCategories.then((data) => {
        res.send(data.flat());
    }).catch((e) => {
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
