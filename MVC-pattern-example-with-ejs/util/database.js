const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: 'product',
    password: 'ajinkya123'  
});

module.exports = pool.promise();