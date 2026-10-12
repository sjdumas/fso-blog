const router = require("express").Router();
const { Blog } = require("../models");

const blogFinder = async (req, res, next) => {
	req.blog = await Blog.findByPk(req.params.id);

	if (!req.blog) {
		return res.status(404).json({ error: "blog not found" });
	}

	next();
};

router.get("/", async (req, res) => {
	const blogs = await Blog.findAll();

	res.json(blogs);
});

router.post("/", async (req, res) => {
	try {
		const blog = await Blog.create(req.body);
		res.status(201).json(blog);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

router.delete("/:id", blogFinder, async (req, res) => {
	await req.blog.destroy();
	res.status(204).end();
});

router.put("/:id", blogFinder, async (req, res) => {
	const { likes } = req.body;

	if (!Number.isInteger(likes)) {
		return res.status(400).json({ error: "likes must be an integer" });
	}

	req.blog.likes = likes;
	await req.blog.save();
	res.json(req.blog);
});

module.exports = router;
