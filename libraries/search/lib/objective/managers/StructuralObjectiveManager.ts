/*
 * Copyright 2020-2021 Delft University of Technology and SynTest contributors
 *
 * This file is part of SynTest Framework - SynTest Core.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Encoding } from "../../Encoding";
import { SearchSubject } from "../../SearchSubject";
import { ObjectiveFunction } from "../ObjectiveFunction";

import { ArchiveBasedObjectiveManager } from "./ArchiveBasedObjectiveManager";
import { ObjectiveManager } from "./ObjectiveManager";

/**
 * Objective manager that only evaluates an encoding on currently reachable and covered objectives.
 *
 * @author Mitchell Olsthoorn
 */
export class StructuralObjectiveManager<
  T extends Encoding
> extends ArchiveBasedObjectiveManager<T> {
  /**
   * @inheritDoc
   * @protected
   */
  protected _updateObjectives(
    objectiveFunction: ObjectiveFunction<T>
  ): ObjectiveFunction<T>[] {
    ObjectiveManager.LOGGER.debug("updating objectives");
    ObjectiveManager.LOGGER.debug(
      `covered: ${objectiveFunction.getIdentifier()}`
    );

    // Remove objective from the current and uncovered objectives
    this._uncoveredObjectives.delete(objectiveFunction);

    // If the objective is a control flow based objective, set the shallow flag
    // This will make sure that the objective is not fully evaluated on the encoding
    objectiveFunction.shallow = true;

    // Add objective to the covered objectives
    this._coveredObjectives.add(objectiveFunction);

    // Add the child objectives to the current objectives
    for (const objective of this._subject.getChildObjectives(
      objectiveFunction
    )) {
      if (
        !this._coveredObjectives.has(objective) &&
        !this._currentObjectives.has(objective)
      ) {
        ObjectiveManager.LOGGER.debug(
          `adding new objective: ${objective.getIdentifier()}`
        );
        this._currentObjectives.add(objective);
      }
    }

    return [];
  }

  /**
   * @inheritDoc
   */
  load(subject: SearchSubject<T>): void {
    // Set the subject
    this._subject = subject;

    // Reset the objective manager
    this._reset();

    // Add all objectives to the uncovered objectives
    const objectives = subject.getObjectives();
    for (const objective of objectives) {
      this._uncoveredObjectives.add(objective);
    }

    // Set the current objectives
    const rootObjectiveIds = this._subject.cfg.functions.map((g) => g.id);

    let rootObjectives: ObjectiveFunction<T>[] = [];
    for (const id of rootObjectiveIds) {
      rootObjectives = [
        ...rootObjectives,
        ...this._subject
          .getObjectives()
          .filter((objective) => objective.getIdentifier() === id),
      ];
    }

    for (const objective of rootObjectives) {
      ObjectiveManager.LOGGER.debug(
        `adding root objective: ${objective.getIdentifier()}`
      );
      this._currentObjectives.add(objective);
    }
  }
}
