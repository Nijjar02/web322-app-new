const fs = require("fs");

var posts = [];
var categories = [];

module.exports.initialize = new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (e, data) => {
        if (e) {
            return reject("unable to read file");
        }
        posts = JSON.parse(data);
        fs.readFile("./data/categories.json", "utf8", (e, data) => {
            if (e) {
                return reject("unable to read file");
            }
            categories = JSON.parse(data);
            resolve("success");
        });
    });
});

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }
    })
};

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        let postsByCategory = posts.filter(post => post.published == true);
        if (postsByCategory.length > 0) {
            resolve(postsByCategory);
        } else {
            reject("no results returned")
        }
    })
};

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let postsByCategory = posts.filter(post => post.published == true && post.category == category);
        if (postsByCategory.length > 0) {
            resolve(postsByCategory);
        } else {
            reject("no results returned")
        }
    });
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.flat().length > 0) {
            resolve(categories.flat());
        } else {
            reject("no results returned");
        }
    });
};

const dateFormat = () => {
    let d = new Date();
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    // console.log(`${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
}

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        let isPublished = false;
        if (postData.published) {
            isPublished = true;
        }
        postData["id"] = posts.length + 1;
        postData["published"] = isPublished;
        postData["postDate"] = dateFormat();
        posts.push(postData);
        resolve("updated");
    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let postsByCategory = posts.filter(x => x.category == category);
        if (postsByCategory.length > 0) {
            resolve(postsByCategory);
        } else {
            reject("no results returned")
        }
    });
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let postsByMinDate = posts.filter(x => new Date(x.postDate) >= new Date(minDateStr));
        if (postsByMinDate.length > 0) {
            resolve(postsByMinDate);
        } else {
            reject("no results returned")
        }
    });
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        let postById = posts.filter(x => x.id == id);
        if (postById.length > 0) {
            resolve(postById);
        } else {
            reject("no results returned")
        }
    });
}
