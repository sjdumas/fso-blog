const router = require("express").Router();
const { User, Blog } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ["userId"] },
    },
  });

  res.json(users);
});

router.post("/", async (req, res) => {
  const { username, name } = req.body;
  const user = await User.create({ username, name });

  res.status(201).json(user);
});

router.get("/:id", async (req, res) => {
  const { read } = req.query;

  if (read !== undefined && read !== "true" && read !== "false") {
    return res.status(400).json({ error: "read must be true or false" });
  }

  const through = { attributes: ["read", "id"] };

  if (read !== undefined) {
    through.where = { read: read === "true" };
  }

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: {
      model: Blog,
      as: "readings",
      attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
      through,
      required: false,
    },
  });

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
