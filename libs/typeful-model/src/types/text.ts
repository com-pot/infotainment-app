import { FromSchema } from "json-schema-to-ts"

export const textContentSchema = {
    oneOf: [
        {type: "string"},
        {
            type: "object",
            properties: {
                html: {type: "string"},
            },
            required: ["html"],
            additionalProperties: false,
        },
    ],
} as const

export type TextContent = FromSchema<typeof textContentSchema>
