import {
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional, ForeignKey
} from 'sequelize';
import sequelize from '../config/connection';


class Items extends Model<
    InferAttributes<Items>, InferCreationAttributes<Items>
> {

    declare itemId: CreationOptional<number>;
    // declare npcId: ForeignKey<number>;
    // declare monsterId: ForeignKey<number>;

    declare npcId: number;
    declare monsterId: number;

    declare name: string;
    declare attack: number;
    declare defense: number;
    declare type: number;

    static associate() {}
}

Items.init({
    itemId: {
      type: DataTypes.TINYINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    npcId: {
    type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
    //   references: {
    //       model: 'Npcs',
    //       key: 'npcId'
    //   }
    },
    monsterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    //   references: {
    //       model: 'Monsters',
    //       key: 'monsterId'
    //   }
    },
    name: DataTypes.STRING(40),
    attack: DataTypes.INTEGER.UNSIGNED,
    defense:DataTypes.INTEGER.UNSIGNED,
    type:DataTypes.TINYINT.UNSIGNED
}, { 
    sequelize,
    modelName: "Items",
    timestamps: false,
});

export default Items;
