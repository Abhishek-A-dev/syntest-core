import {Evaluation} from "../lib/search/objective/Evaluation";
import {Individual} from "../lib/search/gene/Individual";
import {Constructor, Objective} from "../lib";

export class DummyIndividual extends Individual {

    constructor() {
        let actionGene = new Constructor("dummy", "dummy", "dummy", [])
        super(actionGene)
    }


    public setDummyEvaluation(objective: Objective[], values: number[]) {
        let evaluation = new Evaluation();

        if (objective.length != values.length)
            throw new Error('Something bad happened');

        for (let i=0; i<objective.length; i++){
            evaluation.set(objective[i], values[i])
        }

        return this.setEvaluation(evaluation)
    }

}