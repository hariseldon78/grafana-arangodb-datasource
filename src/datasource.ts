import { Database } from 'arangojs';
import dayjs from 'dayjs';
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

import { MyQuery, MyDataSourceOptions, Field } from './types';
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

function isValidDate(x: any) {
    const d = dayjs(x);
    return (
        d.isValid() &&
        d.isBefore(dayjs('2099-12-31T23:59:59Z')) &&
        d.isAfter(dayjs('2000-01-01T00:00:00Z'))
    );
}
function isValidUnixTimestamp(x: any) {
    const d = dayjs(x, 'x', true);
    return d.isValid();
}
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
    async loadFieldsOf(collection: string): Promise<{
        time: Field[];
        number_: Field[];
    }> {
        if (!this.collections.find((c) => c.name === collection)) {
            return { time: [], number_: [] };
        }
        const res = await this.arango.query({
            query: `FOR doc IN @@collection
LIMIT 1
RETURN doc`,
            bindVars: { '@collection': collection },
        });
        const resObj = await res.next();
        const fields = Object.keys(resObj);
        const ret = {
            time: fields
                .filter((fk) => isValidDate(resObj[fk]))
                .map((fk) => ({ name: fk, example: resObj[fk] })),
            number_: fields
                .filter((fk) => _.isNumber(resObj[fk]))
                .map((fk) => ({ name: fk, example: resObj[fk] })),
        };
        console.log(ret);
        return ret;
    }

    async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
        console.log('ArangoDataSource query called:', { options });
        const { range } = options;
        const from_ = range!.from.valueOf();
        const to = range!.to.valueOf();

        // Return a constant for each query.
        let data = [];
        const fieldAlias = (
            name: string,
            alias: string | undefined,
            prefix: string | undefined
        ) => {
            const al = alias ?? name ?? '';
            return prefix ? prefix + '_' + al : al;
        };
        for (const args of options.targets) {
            if (!args.collectionName || args.hide) {
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
                fieldsQuery +=
                    '`' +
                    fieldAlias(name, alias, args.prefix) +
                    '`:doc[@valueField' +
                    i +
                    '],';
                fieldsBinds['valueField' + i] = name;
            }
            const query = `FOR doc IN @@collection
FILTER date_timestamp(doc[@timefield]) >= date_timestamp(@from) AND date_timestamp(doc[@timefield]) <= date_timestamp(@to)
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
            const timeSample = records[0].Time;
            let times: number[];
            if (isValidUnixTimestamp(timeSample)) {
                times = records.map((r) => r.Time);
            } else {
                times = records.map((r) => dayjs(r.Time).valueOf());
            }
            console.log(isValidUnixTimestamp(timeSample), timeSample);
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
                        .map((f) => {
                            const alias = fieldAlias(
                                f.name ?? 'Value',
                                f.alias,
                                args.prefix
                            );
                            return {
                                name: alias,
                                values: records.map((r) => r[alias]),
                                type: FieldType.number,
                            };
                        }),
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
