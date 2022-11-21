import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface Field {
    name?: string;
    alias?: string;
}

export interface MyQuery extends DataQuery {
    collectionName: string;
    timestampField: string;
    valueFields: Field[];
    allFields: string[];
}

export const defaultQuery: Partial<MyQuery> = {
    allFields: [],
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
