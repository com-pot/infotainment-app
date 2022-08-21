import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"

import _programData from "./_programData"


export default defineDataProvider.withSchema({
    argsSchema: {
        type: 'object',
        properties: {
            page: {type: 'number'},
            perPage: {type: 'number', default: 10},
        },
        required: ['page'],
    } as const,

    async load(args) {
        return _programData.load('detail', args)
    },
})

