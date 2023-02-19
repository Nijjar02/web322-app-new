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

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        let isPublished = false;
        if (postData.published) {
            isPublished = true;
        }
        postData["id"] = posts.flat().length + 1;
        postData["published"] = isPublished;
        posts.push(postData);
        resolve("updated");
    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let postsByCategory =  posts.flat().filter(x => x.category == category);
        if(postsByCategory.length > 0) {
            resolve(postsByCategory);
        } else {
            reject("no results returned")
        }
    });
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let postsByMinDate =  posts.flat().filter(x => x.postDate >= minDateStr);
        if(postsByMinDate.length > 0) {
            resolve(postsByMinDate);
        } else {
            reject("no results returned")
        }
    });
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        let postById =  posts.flat().filter(x => x.id == id);
        if(postById.length > 0) {
            resolve(postById);
        } else {
            reject("no results returned")
        }
    });
}
