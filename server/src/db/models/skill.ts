import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/connection';
// import { SkillInputForm } from '../../interfaces/interface';

class Skills extends Model<
    InferAttributes<Skills>,
    InferCreationAttributes<Skills>
> {
    declare skillId: CreationOptional<number>;

    declare name: string;
    declare type: number;
    declare cost: number;
    declare multiple: number;

    static associate() {}

    /***************************************************************
     * 스킬 전체목록 불러오기
     ***************************************************************/
    static async skillList() {
        return await Skills.findAll();
    }

    /***************************************************************
     * 스킬 전체목록 불러오기
     ***************************************************************/
    // static async createItems(characterId: number, pickNum: number) {
    //     const names: string[] = [
    //         '강타',
    //         '연속 베기',
    //         '엑스칼리버',
    //         '매직아머',
    //         '발도',
    //     ];
    //     const type: number[] = [10, 20, 30, 40, 50];
    //     const cost: number[] = [100, 200, 1500, 2000, 2500];
    //     const multiple: number[] = [180, 250, 1000, 0, 1200];

    //     const items: SkillInputForm = {
    //         name: names[pickNum - 1],
    //         type: type[pickNum - 1],
    //         cost: cost[pickNum - 1],
    //         multiple: multiple[pickNum - 1],
    //     };
    //     return await Skills.create(items);
    // }
}

Skills.init(
    {
        skillId: {
            type: DataTypes.TINYINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: DataTypes.STRING(40),
        type: DataTypes.TINYINT.UNSIGNED,
        cost: DataTypes.INTEGER.UNSIGNED,
        multiple: DataTypes.INTEGER.UNSIGNED,
    },
    {
        sequelize,
        modelName: 'Skills',
        timestamps: false,
    }
);

export default Skills;
