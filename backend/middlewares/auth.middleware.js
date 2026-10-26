import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "gemini_secret_jwt_key_2026";

export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = decoded;

        } catch (err) {
            req.user = null;
        }
    } else {
        req.user = null;
    }

    next();
};
