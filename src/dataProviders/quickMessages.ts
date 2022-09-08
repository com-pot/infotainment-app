import { Localized } from "@typeful/model/types/I18n";
import { defineDataProvider } from "../panels/dataProviders";

export default defineDataProvider<QuickMessage[], {now: Date}>({
    async load(args) {
        const now = args.now || new Date()

        let messages = (await this.api.req<any[]>('GET', 'com-pot/infotainment-app/quick-messages.json'))
            .map((message): QuickMessage => {
                return {
                    id: message.id,
                    valid: parseValidSpec(message.valid),
                    content: message.content,
                    author: message.author
                }
            })

        return messages.filter((message) => isValid(now, message.valid))
    }
})

function parseValidSpec(valid: any): QuickMessage['valid'] {
    if (typeof valid === 'boolean') {
        return valid
    }
    if (typeof valid === 'object') {
        const res: QuickMessageValidObj = {}
        if (valid.since) res.since = new Date(valid.since)
        if (valid.until) res.until = new Date(valid.until)
        return res
    }

    if (valid !== undefined && valid !== null) {
        console.warn("Unknown valid value", valid, "assuming true");
    }
    return true
}
function isValid(now: Date, valid: QuickMessage['valid']) {
    if (typeof valid === 'boolean') {
        return valid
    }

    const result = (
        (!valid.since || valid.since <= now)
        && (!valid.until || valid.until >= now)
    )

    return result
}


type QuickMessageValidObj = {since?: Date, until?: Date}
type MessageContentPlain = {
    type: "plain",
    text: string
}
type MessageContentHTML = {
    html: string,
}
type MessageContent = MessageContentPlain | Localized<string | MessageContentHTML>

export type QuickMessage = {
    id: string,
    valid: boolean | QuickMessageValidObj,
    content: MessageContent,
    author: Localized<string>,
}