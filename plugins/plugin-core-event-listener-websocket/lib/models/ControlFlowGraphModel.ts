/*
 * Copyright 2020-2023 Delft University of Technology and SynTest contributors
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
import { RootContext } from "@syntest/analysis";
import {
  ControlFlowProgram,
  makeSerializeable,
  SerializableControlFlowProgram,
} from "@syntest/cfg";

import { Model } from "./Model";

export interface ControlFlowGraphModel extends Model {
  filePath: string;
  cfp?: SerializableControlFlowProgram;
}

export function controlFlowGraphModelFormatter<S>(
  rootContext: RootContext<S>,
  filePath: string,
  cfp?: ControlFlowProgram
): ControlFlowGraphModel {
  return {
    filePath,
    cfp: cfp ? makeSerializeable(cfp) : undefined,
  };
}
