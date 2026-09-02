const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userResult = await pool.query(
            "SELECT id, email, role, first_name, last_name FROM users WHERE id = $1",
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Utilisateur invalide" });
        }

        req.user = userResult.rows[0];

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};
