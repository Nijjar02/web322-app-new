const fs = require("fs");

let posts = [];
let categories = [];

module.exports.initialize = new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (e, data) => {
        if (e) {
            return reject("unable to read file");
        }
        posts.push(JSON.parse(data));
        fs.readFile("./data/categories.json", "utf8", (e, data) => {
            if (e) {
                return reject("unable to read file");
            }
            categories.push(JSON.parse(data));
            resolve("success");
        });
    });
});

module.exports.getAllPosts = new Promise((resolve, reject) => {
    setTimeout(() => {
        if (posts.flat().length === 0) {
            reject(new Error("no results returned"));
        } else {
            resolve(posts);
        }
    }, 10);
});

module.exports.getPublishedPosts = new Promise((resolve, reject) => {
    setTimeout(() => {
        if (posts.flat().length === 0) {
            reject(new Error("no results returned"));
        } else {
            resolve(posts);
        }
    }, 10);
});

module.exports.getCategories = new Promise((resolve, reject) => {
    setTimeout(() => {
        // if (categories.length > 0) {
        if (categories.flat().length > 0) {
            resolve(categories);
        } else {
            reject("no results returned");
        }
    }, 500);
});
