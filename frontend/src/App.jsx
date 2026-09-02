import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "/api");

const DEFAULT_SAMPLE_QUESTIONS = [
    {
        _id: "sample-1",
        questionText: "What is the primary purpose of responsive web design?",
        options: [
            "To make websites load faster on high-speed internet",
            "To adapt layouts seamlessly across diverse screen sizes & devices",
            "To replace CSS with JavaScript completely",
            "To automatically generate database schemas"
        ],
        correctAnswer: "To adapt layouts seamlessly across diverse screen sizes & devices",
        difficulty: "Easy"
    },
    {
        _id: "sample-2",
        questionText: "Which CSS property is used to create a flexible 2-column or multi-column grid layout?",
        options: [
            "display: grid",
            "float: center",
            "position: fixed",
            "align-content: stretch"
        ],
        correctAnswer: "display: grid",
        difficulty: "Medium"
    },
    {
        _id: "sample-3",
        questionText: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
        options: [
            "O(n)",
            "O(n log n)",
            "O(log n)",
            "O(1)"
        ],
        correctAnswer: "O(log n)",
        difficulty: "Hard"
    }
];

function App() {
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [questions, setQuestions] = useState(DEFAULT_SAMPLE_QUESTIONS);
    const [editId, setEditId] = useState(null);
    const [dbConnected, setDbConnected] = useState("checking");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState("All");
    const [submitting, setSubmitting] = useState(false);

    const formRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_URL}/questions`)
            .then((response) => {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setQuestions(response.data);
                }
            })
            .catch(() => {
                // Keep sample questions if API is offline
            });

        let retries = 0;
        const maxRetries = 5;
        
        const checkStatus = () => {
            axios.get(`${API_URL}/db-status`)
                .then((response) => {
                    const isConnected = response.data.status === "connected";
                    setDbConnected(isConnected);
                    if (!isConnected && retries < maxRetries) {
                        retries++;
                        setTimeout(checkStatus, 2000);
                    }
                })
                .catch(() => {
                    setDbConnected(false);
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(checkStatus, 2000);
                    }
                });
        };

        checkStatus();
    }, []);

    const resetForm = () => {
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        setDifficulty("Easy");
        setEditId(null);
    };

    const addQuestion = (e) => {
        e.preventDefault();
        if (!questionText.trim()) return;
        setSubmitting(true);

        const newQuestionObj = {
            _id: "q-" + Date.now(),
            questionText,
            options: [...options],
            correctAnswer,
            difficulty,
        };

        axios
            .post(`${API_URL}/questions`, {
                questionText,
                options,
                correctAnswer,
                difficulty,
            })
            .then((response) => {
                setQuestions((prev) => [...prev, response.data]);
                resetForm();
            })
            .catch((err) => {
                console.warn("API offline, stored locally in memory:", err);
                setQuestions((prev) => [...prev, newQuestionObj]);
                resetForm();
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const editQuestion = (question) => {
        setQuestionText(question.questionText);
        setOptions(question.options && question.options.length === 4 ? question.options : ["", "", "", ""]);
        setCorrectAnswer(question.correctAnswer);
        setDifficulty(question.difficulty || "Easy");
        setEditId(question._id);

        // Smooth scroll to form on mobile/smaller screens
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const updateQuestion = (e) => {
        e.preventDefault();
        if (!questionText.trim()) return;
        setSubmitting(true);

        const updatedData = {
            questionText,
            options: [...options],
            correctAnswer,
            difficulty
        };

        axios.put(`${API_URL}/questions/${editId}`, updatedData)
            .then((response) => {
                setQuestions((prev) =>
                    prev.map((question) =>
                        question._id === editId ? response.data : question
                    )
                );
                resetForm();
            })
            .catch((err) => {
                console.warn("API offline, updated in memory:", err);
                setQuestions((prev) =>
                    prev.map((question) =>
                        question._id === editId ? { ...question, ...updatedData } : question
                    )
                );
                resetForm();
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const deleteQuestion = (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        axios.delete(`${API_URL}/questions/${id}`)
            .then(() => {
                setQuestions((prev) => prev.filter((question) => question._id !== id));
                if (editId === id) resetForm();
            })
            .catch((err) => {
                console.warn("API offline, removed from memory:", err);
                setQuestions((prev) => prev.filter((question) => question._id !== id));
                if (editId === id) resetForm();
            });
    };

    // Filter questions based on search query and difficulty
    const filteredQuestions = questions.filter((q) => {
        const matchesQuery = 
            (q.questionText || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.options || []).some(opt => (opt || "").toLowerCase().includes(searchQuery.toLowerCase())) ||
            (q.correctAnswer || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDifficulty = 
            filterDifficulty === "All" || (q.difficulty || "Easy").toLowerCase() === filterDifficulty.toLowerCase();

        return matchesQuery && matchesDifficulty;
    });

    const easyCount = questions.filter(q => q.difficulty === "Easy").length;
    const medCount = questions.filter(q => q.difficulty === "Medium").length;
    const hardCount = questions.filter(q => q.difficulty === "Hard").length;

    const optionLabels = ["A", "B", "C", "D"];

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-brand">
                    <div className="brand-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <div>
                        <h1>Quiz Question Bank</h1>
                        <p className="header-subtitle">Manage, organize, and practice your question repository</p>
                    </div>
                </div>

                <div className="header-meta">
                    <div className={`db-status-badge ${dbConnected === true ? "connected" : dbConnected === false ? "disconnected" : "checking"}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">
                            {dbConnected === true ? "DB Connected" : dbConnected === false ? "DB Offline (Local Mode)" : "Checking DB..."}
                        </span>
                    </div>

                    <div className="total-badge">
                        <span className="count-num">{questions.length}</span>
                        <span className="count-label">Questions</span>
                    </div>
                </div>
            </header>

            <main className="main-content">
                {/* Left side: Form section */}
                <section className="form-section" ref={formRef}>
                    <div className="form-card">
                        <div className="form-header">
                            <div className="form-title-group">
                                <h2>{editId ? "Edit Question" : "Add New Question"}</h2>
                                <span className="form-subtitle">
                                    {editId ? "Modify existing question parameters" : "Fill out details to expand the bank"}
                                </span>
                            </div>
                            {editId && (
                                <button type="button" className="cancel-edit-btn" onClick={resetForm} title="Discard edits">
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={editId ? updateQuestion : addQuestion} className="question-form">
                            <div className="input-group">
                                <label htmlFor="question-input">
                                    Question Text <span className="required-mark">*</span>
                                </label>
                                <textarea
                                    id="question-input"
                                    rows="3"
                                    placeholder="Enter your question here..."
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="options-group">
                                <label>Options (A - D) <span className="required-mark">*</span></label>
                                <div className="options-inputs-list">
                                    {options.map((option, index) => (
                                        <div key={index} className="option-input-row">
                                            <span className="option-indicator">{optionLabels[index]}</span>
                                            <input
                                                type="text"
                                                placeholder={`Option ${optionLabels[index]}`}
                                                value={option}
                                                onChange={(e) => {
                                                    const newOptions = [...options];
                                                    newOptions[index] = e.target.value;
                                                    setOptions(newOptions);
                                                }}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="correct-answer-input">
                                    Correct Answer <span className="required-mark">*</span>
                                </label>
                                <input
                                    id="correct-answer-input"
                                    type="text"
                                    placeholder="Exact match or option text..."
                                    value={correctAnswer}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    required
                                />
                                {options.some(opt => opt && opt.trim() !== "") && (
                                    <div className="quick-select-answers">
                                        <span className="quick-select-label">Quick select:</span>
                                        {options.map((opt, i) => opt && opt.trim() ? (
                                            <button
                                                type="button"
                                                key={i}
                                                className={`quick-pill ${correctAnswer === opt ? "selected" : ""}`}
                                                onClick={() => setCorrectAnswer(opt)}
                                            >
                                                {optionLabels[i]}: {opt.length > 15 ? opt.slice(0, 15) + "…" : opt}
                                            </button>
                                        ) : null)}
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="difficulty-select">Difficulty Level</label>
                                <div className="select-wrapper">
                                    <select
                                        id="difficulty-select"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                    >
                                        <option value="Easy">🟢 Easy</option>
                                        <option value="Medium">🟡 Medium</option>
                                        <option value="Hard">🔴 Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? (
                                        <span>Saving...</span>
                                    ) : editId ? (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <path d="M20 6L9 17l-5-5"/>
                                            </svg>
                                            Update Question
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            Add Question
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Right side: Questions section */}
                <section className="questions-section">
                    {/* Filter & Search Bar */}
                    <div className="toolbar-card">
                        <div className="search-bar">
                            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search questions, options, answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            {searchQuery && (
                                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filterDifficulty === "All" ? "active" : ""}`}
                                onClick={() => setFilterDifficulty("All")}
                            >
                                All <span className="tab-count">{questions.length}</span>
                            </button>
                            <button
                                className={`filter-tab easy-tab ${filterDifficulty === "Easy" ? "active" : ""}`}
                                onClick={() => setFilterDifficulty("Easy")}
                            >
                                Easy <span className="tab-count">{easyCount}</span>
                            </button>
                            <button
                                className={`filter-tab med-tab ${filterDifficulty === "Medium" ? "active" : ""}`}
                                onClick={() => setFilterDifficulty("Medium")}
                            >
                                Medium <span className="tab-count">{medCount}</span>
                            </button>
                            <button
                                className={`filter-tab hard-tab ${filterDifficulty === "Hard" ? "active" : ""}`}
                                onClick={() => setFilterDifficulty("Hard")}
                            >
                                Hard <span className="tab-count">{hardCount}</span>
                            </button>
                        </div>
                    </div>

                    {/* Questions Feed Header */}
                    <div className="questions-feed-header">
                        <h2>
                            Questions List
                            <span className="results-count">({filteredQuestions.length} displayed)</span>
                        </h2>
                    </div>

                    <div className="questions">
                        {filteredQuestions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📝</div>
                                <h3>No questions found</h3>
                                <p>
                                    {questions.length === 0
                                        ? "Your question bank is empty. Create your first question using the form!"
                                        : "No questions match your current search or filter criteria."}
                                </p>
                                {(searchQuery || filterDifficulty !== "All") && (
                                    <button
                                        className="reset-filters-btn"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setFilterDifficulty("All");
                                        }}
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredQuestions.map((question, idx) => {
                                const diffClass = (question.difficulty || "Easy").toLowerCase();
                                return (
                                    <article
                                        className={`question-card ${editId === question._id ? "is-editing" : ""}`}
                                        key={question._id || idx}
                                    >
                                        <div className="card-top">
                                            <span className="question-index">#{idx + 1}</span>
                                            <span className={`difficulty-badge ${diffClass}`}>
                                                <span className="diff-dot"></span>
                                                {question.difficulty || "Easy"}
                                            </span>
                                        </div>

                                        <h3 className="question-title">
                                            {question.questionText}
                                        </h3>

                                        <div className="options-container">
                                            <span className="options-title">Options:</span>
                                            <div className="options-grid">
                                                {question.options && question.options.map((option, optIdx) => {
                                                    const isCorrect = 
                                                        option && (
                                                            option.trim().toLowerCase() === (question.correctAnswer || "").trim().toLowerCase() ||
                                                            optionLabels[optIdx].toLowerCase() === (question.correctAnswer || "").trim().toLowerCase()
                                                        );
                                                    return (
                                                        <div
                                                            key={optIdx}
                                                            className={`option-pill ${isCorrect ? "is-correct" : ""}`}
                                                        >
                                                            <span className="opt-label">{optionLabels[optIdx]}</span>
                                                            <span className="opt-text">{option}</span>
                                                            {isCorrect && (
                                                                <span className="correct-tag" title="Correct Answer">
                                                                    ✓ Correct
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="answer-section">
                                            <span className="answer-label">Correct Answer:</span>
                                            <span className="answer-value">{question.correctAnswer}</span>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                type="button"
                                                className="btn-edit"
                                                onClick={() => editQuestion(question)}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-delete"
                                                onClick={() => deleteQuestion(question._id)}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;
