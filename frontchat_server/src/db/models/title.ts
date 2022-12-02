import {
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/connection';
import Characters from './character';


class Titles extends Model<
    InferAttributes<Titles>, InferCreationAttributes<Titles>
> {

    declare titleId: CreationOptional<number>;
    declare name: string;

    static associate() {
        this.hasMany(Characters, {
            sourceKey: 'titleId',
            foreignKey: 'titleId'
        });
    }
}

Titles.init({
    titleId: {
      type: DataTypes.TINYINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
}, { 
    sequelize,
    modelName: "Titles",
    timestamps: false,
});

export default Titles;
