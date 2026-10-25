const router = require("express").Router();
const { ReadingList, User, Blog } = require("../models");
const { tokenExtractor } = require("../util/middleware");

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
});

router.put("/:id", tokenExtractor, async (req, res) => {
  const readingList = await ReadingList.findByPk(req.params.id);

  if (!readingList) {
    return res.status(404).json({ error: "reading list entry not found" });
  }

  if (readingList.userId !== req.decodedToken.id) {
    return res.status(401).json({ error: "you can only update your own reading list" });
  }

  const { read } = req.body;

  if (typeof read !== "boolean") {
    return res.status(400).json({ error: "read must be true or false" });
  }

  readingList.read = read;
  await readingList.save();
  res.json(readingList);
});

module.exports = router;
