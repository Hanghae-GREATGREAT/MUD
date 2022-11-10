

interface CommentInterface {

}

interface ItemInputForm {
    npcId:number;
    monsterId:number;
    name:string;
    attack:number;
    defense:number;
    type:number
}

interface SkillInputForm {
    name: string;
    type: number;
    cost: number;
    multiple: number;
}

interface MonsterInputForm {
    fieldId: number;
    name: string;
    type: number;
    hp: number;
    attack: number;
    defense: number;
    exp: number;
}

export {ItemInputForm,SkillInputForm,MonsterInputForm}