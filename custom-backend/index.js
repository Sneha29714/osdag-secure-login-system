const express=require("express");
const cors=require("cors")
require("dotenv").config();
const app=express();
const PORT=process.env.PORT || 3000;
const pool = require("./db");

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Custom Backend Running");
});

app.listen(PORT,()=>{
    console.log(`${PORT} Server running!`);
});