const router = require("express").Router();
const { ReadingList, User, Blog } = require("../models");

router.post("/", async (req, res) => {
	const { blogId, userId } = req.body;

	if (!blogId || !userId) {
		return res.status(400).json({ error: "blogId and userId are required" });
	}

	const blog = await Blog.findByPk(blogId);

	if (!blog) {
		return res.status(404).json({ error: "blog not found" });
	}

	const user = await User.findByPk(userId);

	if (!user) {
		return res.status(404).json({ error: "user not found" });
	}

	const readingList = await ReadingList.create({ blogId, userId });

	res.status(201).json(readingList);
})

module.exports = router;
