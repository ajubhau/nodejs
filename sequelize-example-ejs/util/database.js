const Sequelize = require('sequelize');

const sequelize = new Sequelize('sequelize', 'root', 'ajinkya123', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;