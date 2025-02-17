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

import { prng } from "@syntest/prng";

import { Decoder } from "./Decoder";
import { EncodingSampler } from "./EncodingSampler";
import { ExecutionResult } from "./ExecutionResult";
import { ObjectiveFunction } from "./objective/ObjectiveFunction";
import { shouldNeverHappen } from "./util/diagnostics";

/**
 * Encoding of the search problem.
 *
 * @author Mitchell Olsthoorn
 */
export abstract class Encoding {
  protected _crowdingDistance: number;
  protected _rank: number;
  protected _id: string;
  protected _assertions: Map<string, string>;
  protected _metaComments: string[];

  /**
   * Mapping from objective to their distance values for this test case.
   * @protected
   */
  protected _objectives: Map<ObjectiveFunction<Encoding>, number>;

  /**
   * The last execution result of this test case.
   * @protected
   */
  protected _executionResult: ExecutionResult;

  /**
   * Constructor.
   */
  constructor() {
    this._crowdingDistance = 0;
    this._rank = 0;
    this._id = prng.uniqueId(20);
    this._objectives = new Map<ObjectiveFunction<Encoding>, number>();
    this._assertions = new Map();
    this._metaComments = [];
  }

  abstract mutate(sampler: EncodingSampler<Encoding>): Encoding;

  abstract hashCode(decoder: Decoder<Encoding, string>): number;

  getCrowdingDistance(): number {
    return this._crowdingDistance;
  }

  setCrowdingDistance(value: number): void {
    this._crowdingDistance = value;
  }

  getRank(): number {
    return this._rank;
  }

  setRank(value: number): void {
    this._rank = value;
  }

  get id(): string {
    return this._id;
  }

  get assertions(): Map<string, string> {
    return this._assertions;
  }

  set assertions(value: Map<string, string>) {
    this._assertions = value;
  }

  get metaComments(): string[] {
    return [...this._metaComments];
  }

  addMetaComment(comment: string) {
    this._metaComments.push(comment);
  }

  abstract copy(): Encoding;

  /**
   * Return the execution result.
   */
  getExecutionResult(): ExecutionResult {
    return this._executionResult;
  }

  /**
   * Store the execution result.
   *
   * @param executionResult The execution result to store
   */
  setExecutionResult(executionResult: ExecutionResult): void {
    this._executionResult = executionResult;
  }

  /**
   * Return the distance for the given objective.
   *
   * @param objectiveFunction The objective.
   */
  getDistance(objectiveFunction: ObjectiveFunction<Encoding>): number {
    if (this._objectives.has(objectiveFunction)) {
      if (Number.isNaN(this._objectives.get(objectiveFunction))) {
        throw new TypeError(shouldNeverHappen("Encoding"));
      }
      return this._objectives.get(objectiveFunction);
    } else {
      // this part is needed for DynaMOSA
      // it may happen that the test was created when the objective in input was not part of the search yet
      // with this code, we keep the objective values up to date
      const distance = objectiveFunction.calculateDistance(this);
      if (Number.isNaN(distance)) {
        throw new TypeError(shouldNeverHappen("Encoding"));
      }
      this._objectives.set(objectiveFunction, distance);
      return distance;
    }
  }

  /**
   * Store the distance to an objective for this encoding.
   *
   * @param objectiveFunction The objective
   * @param distance The distance
   */
  setDistance(
    objectiveFunction: ObjectiveFunction<Encoding>,
    distance: number
  ): void {
    if (Number.isNaN(distance)) {
      throw new TypeError(shouldNeverHappen("Encoding"));
    }
    this._objectives.set(objectiveFunction, distance);
  }

  /**
   * Return the length of the encoding/chromosome
   */
  abstract getLength(): number;
}
