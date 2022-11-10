import {
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional, ForeignKey
} from 'sequelize';
import sequelize from '../config/connection';


class Monsters extends Model<
    InferAttributes<Monsters>, InferCreationAttributes<Monsters>
> {

    declare monsterId: CreationOptional<number>;
    // declare fieldId: ForeignKey<number>;

    declare fieldId: number;

    declare name: string;
    declare type: number;
    declare hp: number;
    declare attack:number;
    declare defense: number;
    declare exp: number;

    static associate() {}
}

Monsters.init({
    monsterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    fieldId: {
    type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    //   references: {
    //       model: 'Fields',
    //       key: 'fieldId'
    //   }
    },
    name: DataTypes.STRING(40),
    type: DataTypes.TINYINT.UNSIGNED,
    hp: DataTypes.SMALLINT.UNSIGNED,
    attack: DataTypes.SMALLINT.UNSIGNED,
    defense:DataTypes.SMALLINT.UNSIGNED,
    exp: DataTypes.SMALLINT.UNSIGNED,
}, { 
    sequelize,
    modelName: "Monsters",
    timestamps: false,
});

export default Monsters;
