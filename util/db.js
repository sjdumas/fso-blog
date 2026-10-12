const { Sequelize } = require("sequelize");
const { DATABASE_URL } = require("./config");

const sequelize = new Sequelize(DATABASE_URL, {
	dialect: "postgres",
	dialectOptions: {
		ssl: {
			require: true,
		},
	},
});

const connectToDatabase = async () => {
	try {
		await sequelize.authenticate();
		console.log("Connected to the database");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
		return process.exit(1);
	}

	return null;
};

module.exports = {
	sequelize,
	connectToDatabase
};
