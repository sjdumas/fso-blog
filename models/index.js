const Blog = require("./blog");
const User = require("./user");

User.sync();

module.exports = { 
	Blog,
	User
};
