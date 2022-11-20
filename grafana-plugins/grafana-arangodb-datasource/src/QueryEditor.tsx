import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { ActionMeta, InlineFormLabel, LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { /* FormField, */ Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
    onSelectChange =
        (
            propName: keyof MyQuery,
            f: (value: string) => Promise<void> = () => Promise.resolve()
        ) =>
        (value: SelectableValue<string>, actionMeta: ActionMeta) => {
            const { onChange, query } = this.props;
            const newVal: Record<string, any> = { ...query };
            newVal[propName] = value.value as string;
            onChange(newVal as MyQuery);
            f(value.value as string);
        };
    onCollectionChange = async (
        value: SelectableValue<string>,
        actionMeta: ActionMeta
    ) => {
        const { onChange, query } = this.props;
        const newVal: Record<string, any> = {
            ...query,
            collectionName: value.value as string,

            allFields: await this.props.datasource.loadFieldsOf(value.value as string),
        };
        onChange(newVal as MyQuery);
    };
    onTimestampFieldChange = this.onSelectChange('timestampField');
    onValueFieldChange = this.onSelectChange('valueField');
    render() {
        const query = defaults(this.props.query, defaultQuery);
        const { collectionName, timestampField, valueField, allFields } = query;

        return (
            <div>
                <div className="gf-form">
                    <InlineFormLabel width={10}>Collection</InlineFormLabel>
                    <Select
                        width={30}
                        placeholder={'(none)'}
                        defaultValue={0}
                        options={this.props.datasource.collections.map((c) => ({
                            label: c.name,
                            value: c.name,
                        }))}
                        value={{ label: collectionName, value: collectionName }}
                        allowCustomValue={false}
                        onChange={this.onCollectionChange}
                    />
                </div>
                <div className="gf-form">
                    <InlineFormLabel width={10}>Timestamp field</InlineFormLabel>
                    <Select
                        width={30}
                        placeholder={'(none)'}
                        defaultValue={0}
                        options={allFields.map((f) => ({
                            label: f,
                            value: f,
                        }))}
                        value={{ label: timestampField, value: timestampField }}
                        allowCustomValue={false}
                        onChange={this.onTimestampFieldChange}
                    />
                </div>
                <div className="gf-form">
                    <InlineFormLabel width={10}>Value field</InlineFormLabel>
                    <Select
                        width={30}
                        placeholder={'(none)'}
                        defaultValue={0}
                        options={allFields.map((f) => ({
                            label: f,
                            value: f,
                        }))}
                        value={{ label: valueField, value: valueField }}
                        allowCustomValue={false}
                        onChange={this.onValueFieldChange}
                    />
                </div>
            </div>
        );
    }
}
