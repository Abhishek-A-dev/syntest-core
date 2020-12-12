import {Sampler} from "../..";

/**
 * @author Dimitri Stallenberg
 */
export abstract class Gene {
    public get varName(): string {
        return this._varName;
    }
    public get id(): string {
        return this._uniqueId;
    }
    public get type(): string {
        return this._type;
    }
    public get name(): string {
        return this._name;
    }

    private _name: string;
    private _varName: string
    private _type: string;
    private _uniqueId: string;

    /**
     * Constructor
     * @param name
     * @param type
     * @param uniqueId
     */
    protected constructor(name: string, type: string, uniqueId: string) {
        this._name = name
        this._type = type
        this._uniqueId = uniqueId
        this._varName = type + uniqueId
    }

    /**
     * Mutates the gene
     * @param sampler   the sampler object that is being used
     * @param depth     the depth of the gene in the gene tree
     * @return          the mutated copy of the gene
     */
    abstract mutate(sampler: Sampler, depth: number): Gene

    /**
     * Creates an exact copy of the current gene
     * @return  the copy of the gene
     */
    abstract copy (): Gene

    /**
     * Checks whether the gene has children
     * @return  whether the gene has children
     */
    abstract hasChildren (): boolean

    /**
     * Gets all children of the gene
     * @return  The set of children of this gene
     */
    abstract getChildren (): Gene[]
}

