export type PanelSpecification<TConfig extends object = any> = {
    type: string,
    config: TConfig,

    class?: string,
    style?: Record<string, unknown>|string,
}
