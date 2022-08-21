import { Localized } from "@typeful/model/types/I18n"

export type OccurrenceLocation = {
    app: {
        id: string,
        title: Localized<string>,
    },
    api: never
}