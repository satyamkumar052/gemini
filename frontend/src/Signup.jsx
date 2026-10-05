import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientServer } from "./clientServer.js";
import { MyContext } from "./MyContext.jsx";
import { toast } from "react-toastify";
import "./Auth.css";

function Signup() {
    const navigate = useNavigate();
    const { setUser } = useContext(MyContext);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await clientServer.post("/api/auth/signup", formData);
            const data = response.data;

            // Save to localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (setUser) {
                setUser(data.user);
            }

            toast.success("Account created successfully!");
            navigate("/");
        } catch (err) {
            console.error("Signup failed:", err);
            const msg = err.response?.data?.message || err.message || "Failed to create account";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo-badge">
                        <img src="src/assets/imag2.png" alt="Gemini Logo" />
                        <span>Gemini</span>
                    </div>
                    <h1 className="auth-title">Create an account</h1>
                    <p className="auth-subtitle">Get started with your free Gemini workspace</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="name">Full Name</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-regular fa-user auth-input-icon"></i>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                className="auth-input"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-regular fa-envelope auth-input-icon"></i>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-input-wrapper">
                            <i className="fa-solid fa-lock auth-input-icon"></i>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="auth-input"
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="auth-toggle-pwd"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn-submit" disabled={loading}>
                        {loading ? (
                            <span>Creating account...</span>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <i className="fa-solid fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account?</span>
                    <Link to="/login" className="auth-link">Sign in</Link>
                    <div>
                        <Link to="/" className="auth-back-link">
                            <i className="fa-solid fa-chevron-left"></i> Back to chat
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
