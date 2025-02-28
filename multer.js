var express = require("express");
var fs = require("fs");
var multer = require("multer");
var path = require("path");
var db = require("./db.js");

var app = express();
app.use(express.json());

var file_path = path.join(__dirname, "uploads");
if (!fs.existsSync(file_path)) {
  fs.mkdirSync(file_path, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var multerupload = multer({ storage: storage });

app.post("/upload", multerupload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Validate file type and size
  if (
    (req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/png") ||
    req.file.size > 5 * 1024 * 1024
  ) {
    return res.status(400).send("Invalid file type or size exceeds 5MB");
  }

  var file_name = req.file.filename;
  var file_path = req.file.path;
  var name = req.body.name;

  var sql = "INSERT INTO users (filename, filepath, name) VALUES (?, ?, ?)";
  db.query(sql, [file_name, file_path, name], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send("Database error occurred");
    } else {
      res.send("File uploaded and data inserted successfully");
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
