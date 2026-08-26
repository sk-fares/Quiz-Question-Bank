const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Question = require("./Question");
const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
    console.error("Error: MongoDB connection URI (MONGODB_URI or MONGO_URI) is not defined.");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected successfully to online database"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Quiz Question Bank API is running!");
});

app.get("/questions", async (req, res) => {
    const questions = await Question.find();
    res.json(questions);
});
app.post("/questions", async (req, res) => {
    const question = await Question.create(req.body);
    res.json(question);
});
app.get("/questions/:id", async (req, res) => {
    const question = await Question.findById(req.params.id);
    res.json(question);
});
app.put("/questions/:id", async (req, res) => {
    const question = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json(question);
});
app.delete("/questions/:id", async (req, res) => {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});