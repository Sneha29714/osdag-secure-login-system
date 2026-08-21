const path = require("path");
const fs = require("fs");
const express=require("express");
const cors=require("cors");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
require("dotenv").config();
const app=express();
const PORT=process.env.PORT || 3000;
const pool = require("./db");

app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));
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

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many login attempts. Please try again later."
    }
});

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
            "INSERT INTO users( email, password) VALUES($1, $2)",
            [ email, hashedPassword]
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

app.post("/login", loginLimiter,async(req,res)=>{
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

app.get("/profile", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    res.json({
        message: "You are authenticated",
        userId: req.session.userId
    });
});

app.get("/me", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    try {
        const result = await pool.query(
            "SELECT id, email FROM users WHERE id = $1",
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/files", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, file_name, mime_type, size_bytes, uploaded_at
             FROM files
             WHERE owner_id = $1
             ORDER BY uploaded_at DESC`,
            [req.session.userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/files/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, owner_id, file_name, mime_type, size_bytes, uploaded_at
             FROM files
             WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const file = result.rows[0];

        if (file.owner_id !== req.session.userId) {
            return res.status(403).json({
                message: "You do not have access to this file"
            });
        }

        res.json(file);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/files/:id/download", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, owner_id, file_name, mime_type
             FROM files
             WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const file = result.rows[0];

        if (file.owner_id !== req.session.userId) {
            return res.status(403).json({
                message: "You do not have access to this file"
            });
        }

        const filePath = path.join(__dirname,"..", "uploads", file.file_name);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Physical file not found"
            });
        }

        res.download(filePath, file.file_name);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Could not log out"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logout successful"
        });
    });
});

app.listen(PORT,()=>{
    console.log(`${PORT} Server running!`);
});