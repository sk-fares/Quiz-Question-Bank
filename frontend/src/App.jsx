import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [questions, setQuestions] = useState([]);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/questions`).then((response) => {
            setQuestions(response.data);
        });
    }, []);

    const addQuestion = (e) => {
        e.preventDefault();

        axios
            .post(`${API_URL}/questions`, {
                questionText,
                options,
                correctAnswer,
                difficulty,
            })
            .then((response) => {
                setQuestions([...questions, response.data]);

                setQuestionText("");
                setOptions(["", "", "", ""]);
                setCorrectAnswer("");
                setDifficulty("Easy");
            });
    };
    const editQuestion = (question) => {
        setQuestionText(question.questionText);
        setOptions(question.options);
        setCorrectAnswer(question.correctAnswer);
        setDifficulty(question.difficulty);
        setEditId(question._id);
    };

    const updateQuestion = (e) => {
        e.preventDefault();

        axios.put(`${API_URL}/questions/${editId}`, {
            questionText,
            options,
            correctAnswer,
            difficulty
        })
            .then((response) => {
                setQuestions(
                    questions.map((question) =>
                        question._id === editId ? response.data : question
                    )
                );

                setEditId(null);
                setQuestionText("");
                setOptions(["", "", "", ""]);
                setCorrectAnswer("");
                setDifficulty("Easy");
            });
    };

    const deleteQuestion = (id) => {
        axios.delete(`${API_URL}/questions/${id}`)
            .then(() => {
                setQuestions(
                    questions.filter((question) => question._id !== id)
                );
            });
    };



    return (
    <div>
        <h1>Quiz Question Bank</h1>

        <div className="main-content">

            <div className="form-section">
                <h2>{editId ? "Update Question" : "Add Question"}</h2>

                <form onSubmit={editId ? updateQuestion : addQuestion}>

                    <input
                        type="text"
                        placeholder="Question"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />

                    {options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                setOptions(newOptions);
                            }}
                        />
                    ))}

                    <input
                        type="text"
                        placeholder="Correct Answer"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                    />

                    <label>Difficulty</label>

                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <button type="submit">
                        {editId ? "Update Question" : "Add Question"}
                    </button>

                </form>
            </div>

            <div className="questions-section">
                <h2>Questions</h2>

                <div className="questions">
                    {questions.map((question) => (
                        <div
                            className="question-card"
                            key={question._id}
                        >
                            <p>
                                <strong>Question:</strong>
                                {question.questionText}
                            </p>

                            <p>
                                <strong>Options:</strong>
                                {question.options.map((option, index) => (
                                    <span key={index}>
                                        {option}
                                        <br />
                                    </span>
                                ))}
                            </p>

                            <p>
                                <strong>Correct Answer:</strong>
                                {question.correctAnswer}
                            </p>

                            <p>
                                <strong>Difficulty:</strong>
                                {question.difficulty}
                            </p>

                            <button
                                onClick={() => editQuestion(question)}
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => deleteQuestion(question._id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
);
}

export default App;
