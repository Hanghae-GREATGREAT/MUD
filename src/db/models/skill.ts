import {
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional
} from 'sequelize';
import sequelize from '../config/connection';


class Skills extends Model<
    InferAttributes<Skills>, InferCreationAttributes<Skills>
> {

    declare skillId: CreationOptional<number>;

    declare name: string;
    declare type: number;
    declare cost: number;
    declare multiple: number;

    static associate() {}
}

Skills.init({
    skillId: {
      type: DataTypes.TINYINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING(40),
    type: DataTypes.TINYINT.UNSIGNED,
    cost: DataTypes.INTEGER.UNSIGNED,
    multiple: DataTypes.INTEGER.UNSIGNED
}, { 
    sequelize,
    modelName: "Skills",
    timestamps: false,
});

export default Skills;
