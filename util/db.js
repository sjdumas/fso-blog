const { Sequelize } = require("sequelize");
const { DATABASE_URL, TEST_DATABASE_URL, TESTING } = require("./config");

const databaseUrl = TESTING ? TEST_DATABASE_URL : DATABASE_URL;
const useSsl = !databaseUrl.includes("sslmode=disable");

const sequelize = new Sequelize(databaseUrl, {
	dialect: "postgres",
	dialectOptions: useSsl ? { ssl: { require: true } } : {},
});

const connectToDatabase = async () => {
	try {
		await sequelize.authenticate();
		await sequelize.sync({ alter: true });
		console.log(`Connected to the ${TESTING ? "test" : "development"} database`);
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
