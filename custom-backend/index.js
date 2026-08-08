const express=require("express");
const cors=require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
require("dotenv").config();
const app=express();
const PORT=process.env.PORT || 3000;
const pool = require("./db");

app.use(cors());
app.use(express.json());
app.use(
    session({
        store: new pgSession({
            pool: pool
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60
        }
    })
);

app.get("/",(req,res)=>{
    res.send("Custom Backend Running");
});

app.post("/register", async(req,res)=>{
    try{
        const{email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"Email and password required"
            });
        }
        const existingUser=await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
                if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users(email, password) VALUES($1, $2)",
            [email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/login", async(req,res)=>{
    try{
        const{ email,password }=req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"Email and password are required"
            });
        }

        const result=await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if(result.rows.length==0){
            return res.status(401).json({
                message:"Invalid email or password"
            });
        }
        const user=result.rows[0];
        
        const passwordMatch=await bcrypt.compare(
            password,
            user.password
        );
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        req.session.userId = user.id;

        res.json({
            message: "Login successful"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.listen(PORT,()=>{
    console.log(`${PORT} Server running!`);
});