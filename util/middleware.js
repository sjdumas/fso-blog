const jwt = require("jsonwebtoken");
const { SECRET } = require("./config");
const { Session, User } = require("../models");

const tokenExtractor = async (req, res, next) => {
	const authorization = req.get("authorization");

	if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
		return res.status(401).json({ error: "token missing" });
	}

	const token = authorization.substring(7);

	try {
		req.decodedToken = jwt.verify(token, SECRET);
	} catch {
		return res.status(401).json({ error: "token invalid" });
	}

	const session = await Session.findOne({
		where: { token },
		include: {
			model: User,
			attributes: ["disabled"],
		},
	});

	if (!session) {
		return res
			.status(401)
			.json({ error: "session expired, please log in again" });
	}

	if (session.user.disabled) {
		return res
			.status(401)
			.json({ error: "account disabled, please contact an admin" });
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
