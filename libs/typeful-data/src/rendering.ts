const localeFormatters = {
    time: new Intl.DateTimeFormat('cs', {
        hour: '2-digit',
        minute: '2-digit',
    }),
    date: new Intl.DateTimeFormat('cs', {
        // year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    }),
}

const renderer = {
    day(val: Date) {
        return val.toLocaleDateString('cs', {
            weekday: 'long',
        })
    },
    time(val: Date) {
        return localeFormatters.time.format(val)
    },
    date(val: Date) {
        return localeFormatters.date.format(val)
    },
}

export function useRender() {
    return renderer
}