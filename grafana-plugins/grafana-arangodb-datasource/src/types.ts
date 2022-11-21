import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface Field {
    name?: string;
    example?: string;
    alias?: string;
}

export interface MyQuery extends DataQuery {
    collectionName: string;
    prefix?: string;
    timestampField: string;
    valueFields: Field[];
    allTimeFields: Field[];
    allNumberFields: Field[];
}

export const defaultQuery: Partial<MyQuery> = {
    allTimeFields: [],
    allNumberFields: [],
    valueFields: [],
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
    dbUrl?: string;
    dbName?: string;
    collectionsRegex: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
    apiKey?: string;
}
