import { LocalizedTextContent } from "@typeful/model/types/I18n";
import { defineDataProvider } from "../panels/dataProviders";
import { ValiditySpec } from "@typeful/model/types/time";

export default defineDataProvider<QuickMessage[], {now: Date}>({
    async load() {
        let messages = (await this.api.req<any[]>('GET', 'com-pot/infotainment-app/quick-messages'))
            .map((message): QuickMessage => {
                return {
                    id: message.id,
                    valid: parseValidSpec(message.valid),
                    content: message.content,
                    author: message.author
                }
            })

        return messages
    }
})

function parseValidSpec(valid: any): QuickMessage['valid'] {
    if (typeof valid === 'boolean') {
        return valid
    }
    if (typeof valid === 'object') {
        const res: ValiditySpec = {}
        if (valid.since) res.since = new Date(valid.since)
        if (valid.until) res.until = new Date(valid.until)
        return res
    }

    if (valid !== undefined && valid !== null) {
        console.warn("Unknown valid value", valid, "assuming true");
    }
    return true
}

export type QuickMessage = {
    id: string,
    valid: boolean | ValiditySpec,
    content: LocalizedTextContent,
    author?: LocalizedTextContent,
}
