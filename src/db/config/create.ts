import mysql2 from 'mysql2';
import env from '../../config.env';


const connection = mysql2.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
});

(() => {
    connection.query(`
        DROP DATABASE IF EXISTS ${env.DB_NAME};
    `);
    connection.query(`
        CREATE DATABASE IF NOT EXISTS ${env.DB_NAME};
    `);

    connection.end();
})();
