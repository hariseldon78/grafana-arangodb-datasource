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
            if (!args.collectionName) {continue;}
            const query = await this.arango.query({
                query: `FOR doc IN @@collection
FILTER doc[@timefield] >= date_timestamp(@from) AND doc[@timefield] <= date_timestamp(@to)
SORT doc[@timefield]
RETURN  {Time:doc[@timefield], Value:doc[@valuefield]}`,
                bindVars: {
                    '@collection': args.collectionName,
                    timefield: args.timestampField,
                    valuefield: args.valueField,
                    from: from_,
                    to: to,
                },
            });
            const records = await query.all();
            const times: number[] = records.map((r) => r.Time);
            const values: number[] = records.map((r) => r.Value);
            const frame = new MutableDataFrame({
                refId: args.refId,
                fields: [
                    {
                        name: 'Time',
                        values: times,
                        // values: [times[0], times[times.length - 1]],
                        type: FieldType.time,
                    },
                    {
                        name: 'Value',
                        values: values,
                        // values: [Math.min(...values), Math.max(...values)],
                        type: FieldType.number,
                    },
                ],
            });
            data.push(frame);
            // const query = defaults(target, defaultQuery);
            // return new MutableDataFrame({
            //   refId: query.refId,
            //   fields: [
            //     { name: 'Time', values: [from, to], type: FieldType.time },
            //     { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
            //   ],
            // });

            // const query = defaults(target, defaultQuery);
            // const frame = new MutableDataFrame({
            //     refId: query.refId,
            //     fields: [
            //         { name: 'Time', type: FieldType.time },
            //         { name: 'Value', type: FieldType.number },
            //     ],
            // });
            // const duration = to - from_;
            // const step = duration / 1000;
            // for (let t = 0; t < duration; t += step) {
            //     frame.add({
            //         time: from_ + t,
            //         value: Math.sin((2 * Math.PI * t) / duration),
            //     });
            // }
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
