import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';
import sequelize from '../config/connection';
// import { ItemInputForm } from '../../interfaces/interface';

class Items extends Model<
    InferAttributes<Items>,
    InferCreationAttributes<Items>
> {
    declare itemId: CreationOptional<number>;
    // declare npcId: ForeignKey<number>;
    // declare monsterId: ForeignKey<number>;

    declare npcId: CreationOptional<number>;
    declare monsterId: CreationOptional<number>;

    declare name: CreationOptional<string>;
    declare attack: CreationOptional<number>;
    declare defense: CreationOptional<number>;
    declare type: CreationOptional<number>;

    static associate() {}

    /***************************************************************
     * 장비 전체목록 불러오기, 불러오고 나서 type으로 걸러줄지,
     * type으로 조회해올지 고민
     ***************************************************************/
    static async itemList() {
        return await Items.findAll();
    }

    /***************************************************************
     * 캐릭터 ? 유저 ? 장비 생성 - type이 0이면 무기, 1이면 방어구
     ***************************************************************/
    // static async createItems(
    //     characterId: number,
    //     npcId: number,
    //     pickNum: number
    // ) {
    //     const names: string[] = [
    //         '나무몽둥이',
    //         '츄리닝',
    //         '기본검',
    //         '기본방어구',
    //         '롱소드',
    //         '다이아몬드 메일',
    //         '강철대검',
    //         '메이지 플레이크',
    //         '르탄이의 검',
    //         '르탄이의 방어구',
    //     ];

    //     const attack: number[] = [10, 2, 20, 4, 30, 6, 60, 10, 80, 20];
    //     const defense: number[] = [2, 10, 4, 20, 6, 30, 10, 60, 20, 80];

    //     const items: ItemInputForm = {
    //         npcId,
    //         characterId,
    //         name: names[pickNum - 1],
    //         attack: attack[pickNum - 1],
    //         defense: defense[pickNum - 1],
    //         type: attack[pickNum - 1] > defense[pickNum - 1] ? 0 : 1,
    //     };
    //     return await Items.create(items);
    // }
}

Items.init(
    {
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
        defense: DataTypes.INTEGER.UNSIGNED,
        type: DataTypes.TINYINT.UNSIGNED,
    },
    {
        sequelize,
        modelName: 'Items',
        timestamps: false,
    }
);

export default Items;
