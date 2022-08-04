import { RotationConsumer } from "../rotationConsumer";

export interface RotationEngine {
    start(): void;
    stop(): void;
}

export type RotationEngineFactory<TConfig> = (rotate: RotationConsumer, config: TConfig) => RotationEngine
export const defineRotationEngineFactory = <TConfig=void>(factory: RotationEngineFactory<TConfig>) => factory