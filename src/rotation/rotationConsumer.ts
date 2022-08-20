export function defineRotationConsumer<T extends RotationConsumer>(consumer: T) {
    return consumer
}

export type RotationConsumer = {
    restart?(): void;
    tick(e: Event): RotationStatus;
}
export type RotationStatus = {
    status: 'n/a' | 'running' | 'paused' | 'done' | 'stopped',
    step?: number, prevStep?: number,
    totalSteps?: number,
}

