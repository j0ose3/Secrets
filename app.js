const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
  
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// create a schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required!"]
    },
    password: {
        type: String,
        required: [true, "password is required!"]
    }
});

// Encrypt the password by using mongoose-encryption
const secret = "Thissisoutlittlesecret.";
userSchema.plugin(encrypt, {secret: secret, encryptedFields:["password"]});

// create a model from the schema
const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const newUser = new User ({
        email: username,
        password: password
    });
    newUser.save((err) => {
        if (err){
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser)=>{
        if (err){
            console.log(err);
        } else if (foundUser && foundUser.password === password){
            res.render("secrets");
        };
    });
});


app.listen(3000, ()=>{
    console.log("Server started on port 3000");
});