const Sequelize = require("sequelize");

/* set up sequelize to point to our postgres database */
var sequelize = new Sequelize(
  "jekfhoxo",
  "jekfhoxo",
  "UAO5X4xQI4wq9tjeFdcU8mEJ7P9zi5lP",
  {
    host: "tiny.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
    logging: false,
  }
);

/* Define a "Project" model */
var Project = sequelize.define(
  "Project",
  {
    project_id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

var User = sequelize.define("User", {
  fullName: Sequelize.STRING, // the user's full name (ie: "Jason Bourne")
  title: Sequelize.STRING, // the user's title within the project (ie, developer)
});

var Task = sequelize.define("Task", {
  title: Sequelize.STRING, // title of the task
  description: Sequelize.TEXT, // main text for the task
});

// Associate Tasks with user & automatically create a foreign key
// relationship on "Task" via an automatically generated "UserId" field
User.hasMany(Task);

/* Define a "Name" model */
var Name = sequelize.define("Name", {
  fName: Sequelize.STRING, // first Name
  lName: Sequelize.STRING, // Last Name
});

/* 
 synchronize the Database with our models and automatically add the 
 table if it does not exist
*/
// {force: true}
sequelize.sync().then(function () {
  // return all first names only
  Name.findAll({
    attributes: ["fName"],
  }).then(function (data) {
    console.log("All first names");
    for (var i = 0; i < data.length; i++) {
      console.log(data[i].fName);
    }
  });
});
