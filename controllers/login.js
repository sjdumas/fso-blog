const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { SECRET } = require("../util/config");
const { User, Session } = require("../models");

router.post("/", async (req, res) => {
	const { username } = req.body;

	const user = await User.findOne({
		where: { username },
	});

	if (!user) {
		return res.status(401).json({ error: "invalid username or password" });
	}

	if (user.disabled) {
		return res
			.status(401)
			.json({ error: "account disabled, please contact an admin" });
	}

	const userForToken = {
		username: user.username,
		id: user.id,
	};

	const token = jwt.sign(userForToken, SECRET, {
		jwtid: crypto.randomUUID(),
	});

	await Session.create({ token, userId: user.id });

	res.status(200).json({ token, username: user.username, name: user.name });
});

module.exports = router;
