
export type ValiditySpec = { since?: Date, until?: Date }

export function isValid(now: Date, valid: boolean | ValiditySpec): boolean {
    if (typeof valid === 'boolean' || valid === undefined || valid === null) {
        return !!valid
    }

    const result = (
        (!valid.since || valid.since <= now)
        && (!valid.until || valid.until >= now)
    )

    return result
}
