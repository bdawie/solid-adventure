import express from "express";

import seminarRouter from './routes/seminar.mjs';


const app = express();

// set the static folder
app.use(express.static("public"));

// send home page
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// seminar api 
app.use('/seminar', seminarRouter);

// start the server on port 3000
app.listen(3000, () => {
  console.log("running on 3000");
});
