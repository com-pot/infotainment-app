import { Localized } from "@typeful/model/types/I18n"

type OccurrenceLocationApiForm = {
    id: string,
    title: Localized<string>,
}

export type OccurrenceLocation = {
    app: OccurrenceLocationApiForm,
    api: OccurrenceLocationApiForm,
}
