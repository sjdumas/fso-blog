const router = require("express").Router();
const { User } = require("../models");

router.get("/", async (req, res) => {
	const users = await User.findAll();

	res.json(users);
});

router.post("/", async (req, res) => {
	const { username, name } = req.body;
	const user = await User.create({ username, name });

	res.status(201).json(user);
});

router.get("/:id", async (req, res) => {
	const user = await User.findByPk(req.params.id);

	if (!user) {
		return res.status(404).json({ error: "user not found" });
	}
	
	res.json(user);
});

router.put("/:username", async (req, res) => {
	const user = await User.findOne({
		where: { username: req.params.username },
	});

	if (!user) {
		return res.status(404).json({ error: "user not found" });
	}

	user.name = req.body.name;
	await user.save();
	res.json(user);
});

module.exports = router;
