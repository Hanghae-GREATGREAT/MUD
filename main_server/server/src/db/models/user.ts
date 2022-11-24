import {
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/connection';
import Characters from './character';


class Users extends Model<
    InferAttributes<Users>, InferCreationAttributes<Users>
> {

    declare userId: CreationOptional<number>;
    declare username: string;
    declare password: string;
    declare createdAt: CreationOptional<number>;
    declare updatedAt: CreationOptional<number>;

    static associate() {
      this.hasOne(Characters, {
        sourceKey: 'userId',
        foreignKey: 'userId'
      });
    }
}

Users.init({
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      defaultValue: (Date.now()/1000)|0 + 60 * 60 * 9,
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      defaultValue: (Date.now()/1000)|0 + 60 * 60 * 9,
    },
}, { 
    sequelize,
    modelName: "Users"
});

export default Users;
