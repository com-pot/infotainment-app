import {defaults} from 'lodash'

export type ApiOpts = {
    baseUrl: string,
    
    requestDefaults?: Partial<RequestOpts>,
}

export class ApiAdapter {
    
    constructor(private opts: ApiOpts) { }
    
    request<TResultPayload = any>(method: string, path: string, payload?: Record<string, unknown>, query?: Query, opts?: RequestOpts) {
        const headers: RequestInit['headers'] = {}
        const o = defaults({}, opts, this.opts.requestDefaults)
        
        if (o.accept === 'json') {
            headers.accept = 'application/json'
        }
        
        const request: RequestConfig = {
            method, url: this.createUrl(path, query).toString(),
            headers,
            body: JSON.stringify(payload),
        }
        
        return fetch(request.url, request)
            .then(async (response) => {
                return Object.assign(response, {
                    payloadStr: await response.text(),
                }) as ApiResponse<TResultPayload>
            })
            .then((response) => {
                if (!response.ok) {
                    throw new ApiClientError('Request ended with erroneous status', request, response)
                }
                if (o.accept === 'json') {
                    const responseType = response.headers.get('Content-Type')
                    if (!responseType || !responseType.includes('application/json')) {
                        throw new ApiClientError("Response is not acceptable - wrong content-type", request, response)
                    }
                    response.payload = JSON.parse(response.payloadStr)
                }
                return response
            }, (err) => {throw new ApiClientError("Failed to execute request", request, undefined, err)})
    }

    async req<TResultPayload = any>(method: string, path: string, payload?: Record<string, unknown>, query?: Query, opts?: RequestOpts) {
        const response = await this.request<TResultPayload>(method, path, payload, query, opts)
        return response.payload
    }
    
    private createUrl(path: string, query?: Query) {
        const url = new URL(path, this.opts.baseUrl)
        
        if (typeof query === 'string') {
            url.search = query
        } else if (query) {
            Object.entries(query).forEach(([name, value]) => {
                url.searchParams.append(name, value.toString())
            })
        }
        
        return url
    }
}

type Query = Record<string, string|number|boolean> | string

type RequestOpts = {
    accept?: 'json' | string,
    allowNoContent?: boolean,
}

type RequestConfig = {
    url: string
} & RequestInit

type ApiResponse<TJsonPayloadData = any> = Response & {
    payloadStr: string,
    payload: TJsonPayloadData,
}

class ApiClientError extends Error {
    constructor (message: string, public readonly request: RequestConfig, public readonly response?: Response, public readonly err?: any)  {
        super(message)
    }
}