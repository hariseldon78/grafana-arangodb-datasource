import defaults from 'lodash/defaults';
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

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

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

    async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
        console.log('ArangoDataSource query called:', { options });
        const { range } = options;
        const from_ = range!.from.valueOf();
        const to = range!.to.valueOf();

        // Return a constant for each query.
        const data = options.targets.map((target) => {
            // const query = defaults(target, defaultQuery);
            // return new MutableDataFrame({
            //   refId: query.refId,
            //   fields: [
            //     { name: 'Time', values: [from, to], type: FieldType.time },
            //     { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
            //   ],
            // });
            const query = defaults(target, defaultQuery);
            const frame = new MutableDataFrame({
                refId: query.refId,
                fields: [
                    { name: 'time', type: FieldType.time },
                    { name: 'value', type: FieldType.number },
                ],
            });
            const duration = to - from_;
            const step = duration / 1000;
            for (let t = 0; t < duration; t += step) {
                frame.add({
                    time: from_ + t,
                    value: Math.sin((2 * Math.PI * t) / duration),
                });
            }
        });

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
