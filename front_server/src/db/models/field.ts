import {
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/connection';
import Characters from './character';


class Fields extends Model<
    InferAttributes<Fields>, InferCreationAttributes<Fields>
> {

    declare fieldId: CreationOptional<number>;
    declare name: string;
    declare level: number;

    static associate() {
        this.hasMany(Characters, {
            sourceKey: 'fieldId',
            foreignKey: 'fieldId'
        });
    }
}

Fields.init({
    fieldId: {
      type: DataTypes.TINYINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    level: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    }
}, { 
    sequelize,
    modelName: "Fields",
    timestamps: false,
});

export default Fields;
