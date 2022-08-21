import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { ProgramItemOccurence } from "libs/com-pot/schedule/src/model/ProgramItemOccurrence";
import { ProgramScheduleItem } from "@com-pot/schedule/model/ProgramScheduleItem";

import programData from "./_programData"

export default defineDataProvider.withSchema({
    argsSchema: {
        type: 'object',
        properties: {
            from: {type: 'string', format: 'date'},
            to: {type: 'string', format: 'date'},
        },
        required: ['from', 'to'],
    } as const,

    async load(args) {
        return programData.load('overview', args)
    },
})

export type ProgramEntriesGroup<TState extends ModelState = 'app'> = {
    date: Date,
    items: ProgramItemOccurence[TState][],
}
