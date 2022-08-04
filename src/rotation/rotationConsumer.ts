export function defineRotationConsumer<T extends RotationConsumer>(consumer: T) {
    return consumer
}

export type RotationConsumer = {
    tick(e: Event): RotationStatus;
}
export type RotationStatus = {
    status: 'n/a' | 'running' | 'paused' | 'done' | 'stopped',
    step?: number,
    totalSteps?: number,
}

