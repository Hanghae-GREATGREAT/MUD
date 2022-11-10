import { Sequelize } from 'sequelize';
import env from '../../config.env';


const sequelize = new Sequelize({
    host: env.DB_HOST,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    dialect: 'mysql',
    // logging: false,
});


export default sequelize;