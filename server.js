const express = require("express");
const path = require("path");
const app = express();
const blogService = require("./blog-service");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/blog", (req, res) => {
  res.json({ res: "blog" });
});

app.get("/posts", (req, res) => {
  res.json({ res: "posts" });
});

app.get("/categories", (req, res) => {
  res.json({ res: "categories" });
});

app.listen(process.env.POST || 8080, () => {
  console.log(`Express http server listening on port 8080`);
});
