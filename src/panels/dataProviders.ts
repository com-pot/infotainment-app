import { JSONSchema7, FromSchema } from 'json-schema-to-ts'
import { PanelDataLoader } from "./panelData"

type PanelDataProvider<TData = any, TArgs = any> = {
    load(this: PanelDataLoader, args: TArgs): Promise<TData>,
}
type PanelDataProviderSchemaArgs<TData = any, TArgsSchema extends JSONSchema7 = any> = PanelDataProvider<TData, FromSchema<TArgsSchema>> & {
    argsSchema: TArgsSchema,
}

export type PanelDataProviderUntyped = {
    load(this: PanelDataLoader, args: any): Promise<any>,
}

const defineUntyped = <TData, TArgs>(provider: PanelDataProvider<TData, TArgs>) => provider
const defineWithSchema = <TData, TSchema extends JSONSchema7>(provider: PanelDataProviderSchemaArgs<TData, TSchema>) => provider

export const defineDataProvider: typeof defineUntyped & {
    withSchema: typeof defineWithSchema
} = Object.assign(defineUntyped, {
    withSchema: defineWithSchema,
})
