const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Question = require("./Question");
const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://skmdfares4_db_user:mxz12cV2V1Vk4Syg@cluster0.tyb5j8w.mongodb.net/QuizDB";

const dbPromise = mongoose.connect(mongoURI)
    .then((m) => {
        console.log("MongoDB connected successfully to online database (QuizDB)");
        return m;
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        if (require.main === module) {
            process.exit(1);
        }
        throw err;
    });

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Quiz Question Bank API is running!");
});

app.get("/db-status", async (req, res) => {
    try {
        await dbPromise;
        const state = mongoose.connection.readyState;
        res.json({ 
            status: state === 1 ? "connected" : "disconnected",
            readyState: state
        });
    } catch (err) {
        res.json({ 
            status: "disconnected",
            readyState: mongoose.connection.readyState,
            error: err.message
        });
    }
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

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;