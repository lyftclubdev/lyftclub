//This is a backend ?

const express = require("express");
const app = express();
const indexRouter = require("./routers/indexRouter");

app.use(express.json());
app.use("/api", indexRouter); //app.use(indexRouter);

//this is the url we listen to

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("server started on port 3000");
});