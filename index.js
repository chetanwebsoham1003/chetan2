import express from "express";
import path from 'path'
import mongoose from "mongoose";
import { name } from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { decode } from "punycode";
import { userInfo } from "os";
import { match } from "assert";
import bcrypt from "bcrypt"




mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
}).then(() => console.log("database connected")).catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});


const user = mongoose.model("User", userSchema)

const app = express();



app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// app.get("/home",(req,res) => {
//     let path1 = path.resolve();
//     let indexFile = path.join(path1,"index.html")
//  console.log('path',path1)
//  console.log('indexFile',indexFile)
//  res.sendFile(indexFile);
//     // res.send("hello");
// });
// setting up view Engine

app.set("view engine", "ejs");



const isAuthenicated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "acdfdfd");
        
        req.user = await user.findById(decoded._id);        
        next();
    }
    else {
        res.render("login");
    }

}


app.get("/", isAuthenicated, (req, res) => {
    console.log(req.user);
    res.redirect('/logout')
});





app.get("/logout", isAuthenicated, (req, res) => {
    res.render("logout",{name: req.user.name});
});

app.get("/register",(req, res) => {
    res.render("register");
});

app.post("/singup", async ( req,res)=>{
    const { name, email,password } = req.body;
    const  User = await user.create({
        name,
        email,
        password
    });
res.redirect("/login")
});


// app.get("/", (req, res) => {
//     const { token } = req.cookies;
//     if (token) {
//         res.render("logout");
//     }

//     else {
//         res.render("login");
//     }

//     res.render("login");
// });

app.get("/login", async (req,res )=> {
    res.render("login",{message:"password Invalid"})
})
app.post("/login", async (req, res) => {
    const  { name, email ,password } = req.body;
    console.log("user pass",password)
    console.log("user email",email)

let user1 = await user.findOne({email});

console.log("db user",user1);
console.log("db email",user1.email);
console.log("db password",user1.password);

if (!user1){
    return res.redirect("/register")

}else if(user1.password===password) { 
    console.log('user_id',user1._id)
    const token = jwt.sign({ _id: user1._id }, "acdfdfd");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    })
    res.redirect("/logout")
}else{
    console.log("inncorect passward");
    return res.redirect("/login",);
}


 /*const  User = await user.create({
        name,
        email,
    });
*/
    
});

app.get("/logout", (req, res) => {
    const token = res.cookie("token", "null", {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    console.log('token=',token)
    if(token == null){
        res.redirect("/register")
    }
});







// //router
// app.get("/success",(req,res) =>{
//     res.render("success")
// })

// //api
// app.post("/contact", async (req,res) => {
//     const { name , email} = req.body;
//     await Messge.create({name,email})
// //    await Messge.create({name : req.body.name, email : req.body.email});
//    res.redirect("/success");
// })

// app.get("/users",(req,res)=>{
//     res.json({
//         users,
//     });
// });

app.listen(5000, () => {
    console.log("server is working")
});