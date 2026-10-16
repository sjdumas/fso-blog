const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../util/db");

class Blog extends Model {}

Blog.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		author: {
			type: DataTypes.TEXT,
		},
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		title: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		likes: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		year: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				isInt: {
					msg: "year must be an integer",
				},
				isWithinRange(value) {
					const currentYear = new Date().getFullYear();

					if (value < 1991 || value > currentYear) {
						throw new Error(`year must be between 1991 and ${currentYear}`);
					}
				},
			},
		},
	},
	{
		sequelize,
		underscored: true,
		modelName: "blog",
	}
);

module.exports = Blog;
