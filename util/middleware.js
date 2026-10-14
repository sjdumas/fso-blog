const jwt = require("jsonwebtoken");
const { SECRET } = require("./config");

const tokenExtractor = (req, res, next) => {
	const authorization = req.get("authorization");

	if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
		return res.status(401).json({ error: "token missing" });
	}

	try {
		req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
	} catch {
		return res.status(401).json({ error: "token invalid" });
	}

	next();
};

const errorHandler = (error, req, res, next) => {
	console.error(error.message);

	if (
		error.name === "SequelizeValidationError" ||
		error.name === "SequelizeUniqueConstraintError"
	) {
		return res.status(400).json({
			error: error.errors.map((e) => e.message),
		});
	}

	if (error.name === "SequelizeDatabaseError") {
		return res.status(400).json({ error: [error.message] });
	}

	next(error);
};

module.exports = { tokenExtractor, errorHandler };
