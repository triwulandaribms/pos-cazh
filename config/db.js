const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const environment = process.env.NODE_ENV;

const config = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
  },
};

const sequelizeConfig = config[environment];

const sequelizeInstance = new Sequelize(
  sequelizeConfig.database,
  sequelizeConfig.username,
  sequelizeConfig.password,
  {
    host: sequelizeConfig.host,
    dialect: sequelizeConfig.dialect,
    port: sequelizeConfig.port,
    logging: false,
  }
);

module.exports = { sequelize: sequelizeInstance };