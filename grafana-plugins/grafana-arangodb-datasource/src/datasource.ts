import { Database } from 'arangojs';
import { CollectionMetadata } from 'arangojs/collection';
import _ from 'lodash';

import {
    DataQueryRequest,
    DataQueryResponse,
    DataSourceApi,
    DataSourceInstanceSettings,
    MutableDataFrame,
    FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
    arango: Database;
    collections: CollectionMetadata[] = [];
    constructor(
        public instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>
    ) {
        super(instanceSettings);
        const { dbUrl: url, dbName: databaseName } = this.instanceSettings.jsonData;
        console.log({ url, databaseName });
        this.arango = new Database({ url, databaseName });
        void this.setup();
    }
    async setup() {
        const { collectionsRegex } = this.instanceSettings.jsonData;
        this.collections = (await this.arango.listCollections()).filter(
            (c) =>
                !collectionsRegex ||
                collectionsRegex === '' ||
                c.name.match(collectionsRegex)
        );
        console.log(this.collections);
    }
    async loadFieldsOf(collection: string): Promise<string[]> {
        if (!this.collections.find((c) => c.name === collection)) {
            return [];
        }
        const res = await this.arango.query({
            query: `FOR doc IN @@collection
LIMIT 1
RETURN doc`,
            bindVars: { '@collection': collection },
        });
        const fields = Object.keys(await res.next());
        console.log(fields);
        return fields;
    }

    async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
        console.log('ArangoDataSource query called:', { options });
        const { range } = options;
        const from_ = range!.from.valueOf();
        const to = range!.to.valueOf();

        // Return a constant for each query.
        let data = [];
        for (const args of options.targets) {
            if (!args.collectionName) {
                continue;
            }
            let fieldsQuery = '';
            const fieldsBinds: Record<string, string> = {};
            for (const field of args.valueFields) {
                let { name, alias } = field;
                const i = Object.keys(fieldsBinds).length;
                if (!name) {
                    continue;
                }
                if (!alias) {
                    alias = name;
                }
                fieldsQuery += '`' + alias + '`:doc[@valueField' + i + '],';
                fieldsBinds['valueField' + i] = name;
            }
            const query = `FOR doc IN @@collection
FILTER doc[@timefield] >= date_timestamp(@from) AND doc[@timefield] <= date_timestamp(@to)
SORT doc[@timefield]
RETURN  {Time:doc[@timefield], ${fieldsQuery}}`;
            console.log(query);
            const result = await this.arango.query({
                query,
                bindVars: {
                    '@collection': args.collectionName,
                    timefield: args.timestampField,
                    ...fieldsBinds,
                    from: from_,
                    to: to,
                },
            });
            const records = await result.all();
            const times: number[] = records.map((r) => r.Time);
            // const values: number[] = records.map((r) => r.Value);
            const frame = new MutableDataFrame({
                refId: args.refId,
                fields: [
                    {
                        name: 'Time',
                        values: times,
                        type: FieldType.time,
                    },
                    ...args.valueFields
                        .filter((f) => !!f.name)
                        .map((f) => ({
                            name: f.alias ?? f.name ?? 'Value',
                            values: records.map((r) => r[f.alias ?? f.name ?? 'Value']),
                            type: FieldType.number,
                        })),
                    // {
                    //     name: 'Value',
                    //     values: values,
                    //     type: FieldType.number,
                    // },
                ],
            });
            data.push(frame);
        }

        return { data };
    }

    async testDatasource() {
        const {
            collectionsRegex,
            dbUrl: url,
            dbName: databaseName,
        } = this.instanceSettings.jsonData;
        // Implement a health check for your data source.

        let success = true;
        // try {
        const arango = new Database({ url, databaseName });
        let dbName = 'error';
        let collections = 'error';
        try {
            dbName = (await arango.get()).name;
            collections = (await arango.listCollections())
                .filter((c) => c.name.match(collectionsRegex))
                .map((c) => c.name)
                .slice(0, 5)
                .join(',');
        } catch (e: any) {
            success = false;
            dbName = e.message;
        }
        return {
            status: success,
            message: `db=${dbName}, collections=[${collections},...]`,
        };
    }
}
