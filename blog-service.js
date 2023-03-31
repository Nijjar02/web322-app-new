const Sequelize = require("sequelize");
const {gte} = Sequelize.Op;

/* 
 set up sequelize to point to our postgres database 
*/
var sequelize = new Sequelize(
    "jekfhoxo",
    "jekfhoxo",
    "UAO5X4xQI4wq9tjeFdcU8mEJ7P9zi5lP",
    {
        host: "tiny.db.elephantsql.com",
        dialect: "postgres",
        port: 5432,
        dialectOptions: {
            ssl: {rejectUnauthorized: false},
        },
        query: {raw: true}
    }
);

var Post = sequelize.define("Post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
    category: Sequelize.STRING,
});

Post.belongsTo(Category, {foreignKey: "category"}); // relationship

/* ---------------------------------------- */
/* ---------------------------------------- */
module.exports.initialize = () => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => resolve("success")).catch(() => reject("unable to sync the database"));
    });
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({where: {published: true}})
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({where: {published: true, category: category}})
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;
        for (let post in postData) {
            if (postData[post] === "") {
                postData[post] = null;
            }
        }
        postData.postDate = new Date();
        // console.log(postData);

        Post.create(postData)
            .then(() => {
                resolve();
            })
            .catch(() => reject("unable to create post"));
    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({where: {category: category}})
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Post.findAll({where: {postDate: {[gte]: new Date(minDateStr)}}})
            .then((data) => {
                resolve(postsByCategory);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({where: {id: id}})
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => reject("no results returned"));
    });
};

module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (let category in categoryData) {
            if (categoryData[category] === "") {
                categoryData[category] = null;
            }
        }
        // console.log(categoryData);

        Category.create(categoryData)
            .then(() => {
                resolve();
            })
            .catch(() => reject("unable to create category"));
    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({where: {id: id}})
            .then(() => {
                resolve();
            })
            .catch((e) => reject(e));
    });
};

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({where: {id: id}})
            .then(() => {
                resolve();
            })
            .catch((e) => reject(e));
    });
};
