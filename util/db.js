const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const { DATABASE_URL, TEST_DATABASE_URL, TESTING } = require("./config");

const databaseUrl = TESTING ? TEST_DATABASE_URL : DATABASE_URL;
const useSsl = !databaseUrl.includes("sslmode=disable");

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  dialectOptions: useSsl ? { ssl: { require: true } } : {},
});

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: { glob: "migrations/*.js" },
    storage: new SequelizeStorage({ sequelize, tableName: "migrations" }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });

  const migrations = await migrator.up();
  console.log("Migrations up to date", {
    files: migrations.map((migration) => migration.name),
  });
};

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
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
