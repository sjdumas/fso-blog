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

module.exports = { errorHandler };
