import { HttpResponse } from "../models/http-response-model"


export const ok = async (data: any): Promise<HttpResponse> => {
    return {
        statusCode: 200,
        body: data
    }
}

export const noContent = async (): Promise<HttpResponse> => {
    return {
        statusCode: 204,
        body: null
    }
}

export const badRequest = async (error: Error): Promise<HttpResponse> => {
    return {
        statusCode: 400,
        body: error
    }
}

export const serverError = async (error: Error): Promise<HttpResponse> => {
    return {
        statusCode: 500,
        body: error
    }
}

export const unauthorized = async (): Promise<HttpResponse> => {
    return {
        statusCode: 401,
        body: null
    }
}

export const forbidden = async (): Promise<HttpResponse> => {
    return {
        statusCode: 403,
        body: null
    }
}

export const notFound = async (): Promise<HttpResponse> => {
    return {
        statusCode: 404,
        body: []
    }
}
