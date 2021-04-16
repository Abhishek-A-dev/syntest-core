import { Encoding } from "../../Encoding";
import { ObjectiveFunction } from "../ObjectiveFunction";
import { Archive } from "../../Archive";
import { SearchSubject } from "../../SearchSubject";
import { EncodingRunner } from "../../EncodingRunner";
import { ExceptionObjectiveFunction } from "../../../criterion/ExceptionObjectiveFunction";
import * as crypto from "crypto";
import { BudgetManager } from "../../budget/BudgetManager";

/**
 * Manager that keeps track of which objectives have been covered and are still to be searched.
 *
 * @author Mitchell Olsthoorn
 */
export abstract class ObjectiveManager<T extends Encoding> {
  /**
   * Archive of covered objectives with the fittest encoding for that objective.
   * @protected
   */
  protected _archive: Archive<T>;

  /**
   * Set of current objectives.
   * @protected
   */
  protected _currentObjectives: Set<ObjectiveFunction<T>>;

  /**
   * Set of covered objectives.
   * @protected
   */
  protected _coveredObjectives: Set<ObjectiveFunction<T>>;

  /**
   * Set of uncovered objectives.
   * @protected
   */
  protected _uncoveredObjectives: Set<ObjectiveFunction<T>>;

  /**
   * Runner for executing encodings.
   * @protected
   */
  protected _runner: EncodingRunner<T>;

  /**
   * The subject of the search.
   * @protected
   */
  protected _subject: SearchSubject<T>;

  /**
   * Constructor.
   *
   * @param runner Encoding runner
   * @protected
   */
  protected constructor(runner: EncodingRunner<T>) {
    this._archive = new Archive<T>();
    this._currentObjectives = new Set<ObjectiveFunction<T>>();
    this._coveredObjectives = new Set<ObjectiveFunction<T>>();
    this._uncoveredObjectives = new Set<ObjectiveFunction<T>>();
    this._runner = runner;
  }

  /**
   * Update the objectives.
   *
   * @param objectiveFunction
   * @param encoding
   * @param distance
   * @protected
   */
  protected abstract _updateObjectives(
    objectiveFunction: ObjectiveFunction<T>,
    encoding: T,
    distance: number
  ): void;

  /**
   * Evaluate multiple encodings on the current objectives.
   *
   * @param encodings The encoding to evaluate
   * @param budgetManager The budget manager to track the remaining budget
   */
  public async evaluateMany(
    encodings: T[],
    budgetManager: BudgetManager<T>
  ): Promise<void> {
    for (const encoding of encodings) {
      // If there is no budget left, stop evaluating
      if (!budgetManager.hasBudgetLeft()) break;

      await this.evaluateOne(encoding, budgetManager);
    }
  }

  /**
   * Evaluate one encoding on the current objectives.
   *
   * @param encoding The encoding to evaluate
   * @param budgetManager The budget manager to track evaluation
   */
  public async evaluateOne(
    encoding: T,
    budgetManager: BudgetManager<T>
  ): Promise<void> {
    // Execute the encoding
    const result = await this._runner.execute(encoding);
    budgetManager.evaluation(encoding);

    // Store the execution result in the encoding
    encoding.setExecutionResult(result);

    // For all current objectives
    this._currentObjectives.forEach((objectiveFunction) => {
      // Calculate and store the distance
      const distance = objectiveFunction.calculateDistance(encoding);
      encoding.setObjective(objectiveFunction, distance);

      // Update the objectives
      this._updateObjectives(objectiveFunction, encoding, distance);
    });

    // Create separate exception objective when an exception occurred in the execution
    if (result.hasExceptions()) {
      const hash = crypto
        .createHash("md5")
        .update(result.getExceptions())
        .digest("hex");

      const numOfExceptions = this._archive
        .getObjectives()
        .filter((objective) => objective instanceof ExceptionObjectiveFunction)
        .filter((objective) => objective.getIdentifier() === hash).length;
      if (numOfExceptions === 0) {
        this._archive.update(
          new ExceptionObjectiveFunction(
            this._subject,
            hash,
            result.getExceptions()
          ),
          encoding
        );
      }
    }
  }

  /**
   * Load the objectives from the search subject into the manager.
   *
   * @param subject The subject to load in
   */
  public abstract load(subject: SearchSubject<T>): void;

  /**
   * Return the uncovered objectives.
   */
  public getUncoveredObjectives(): Set<ObjectiveFunction<T>> {
    return this._uncoveredObjectives;
  }

  /**
   * Return the current objectives.
   */
  public getCurrentObjectives(): Set<ObjectiveFunction<T>> {
    return this._currentObjectives;
  }

  /**
   * Return the covered objectives.
   */
  public getCoveredObjectives(): Set<ObjectiveFunction<T>> {
    return this._coveredObjectives;
  }

  /**
   * Return the archive.
   */
  public getArchive(): Archive<T> {
    return this._archive;
  }

  /**
   * Determines if there are objectives left to cover.
   */
  public hasObjectives(): boolean {
    return this._currentObjectives.size > 0;
  }
}
