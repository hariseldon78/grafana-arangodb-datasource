import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { ActionMeta, Button, InlineFormLabel, LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, Field, MyQuery } from './types';

const { FormField, Select } = LegacyForms;

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
        const { time, number_ } = await this.props.datasource.loadFieldsOf(
            value.value as string
        );
        const newVal: Record<string, any> = {
            ...query,
            collectionName: value.value as string,
            allTimeFields: time,
            allNumberFields: number_,
        };
        onChange(newVal as MyQuery);
    };
    onTimestampFieldChange = this.onSelectChange('timestampField');
    onValueFieldChange =
        (i: number) => async (value: SelectableValue<string>, actionMeta: ActionMeta) => {
            const { onChange, query } = this.props;
            const valueFields = [...(query.valueFields ?? [])];
            const old = valueFields[i] ?? {};
            old.name = value.value ?? '';
            valueFields[i] = old;
            const newVal: Record<string, any> = {
                ...query,
                valueFields,
            };
            onChange(newVal as MyQuery);
            console.log(query);
        };
    onAddField = async () => {
        const { onChange, query } = this.props;
        const valueFields = [...(query.valueFields ?? [])];
        valueFields.push({});
        const newVal: Record<string, any> = {
            ...query,
            valueFields,
        };
        onChange(newVal as MyQuery);
    };
    onRemoveField = (i: number) => async () => {
        const { onChange, query } = this.props;
        const valueFields = [...(query.valueFields ?? [])];
        valueFields.splice(i, 1);
        const newVal: Record<string, any> = {
            ...query,
            valueFields,
        };
        onChange(newVal as MyQuery);
    };
    onPrefixChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query } = this.props;
        onChange({ ...query, prefix: event.target.value });
    };
    render() {
        const query = defaults(this.props.query, defaultQuery);
        const {
            collectionName,
            prefix,
            timestampField,
            valueFields,
            allTimeFields,
            allNumberFields,
        } = query;

        const fieldLabel = (f: Field) =>
            f.example ? f.name + ' (' + f.example + ')' : f.name;
        const fields = [];
        for (let i = 0; i < valueFields.length; ++i) {
            const valueField = valueFields[i].name;
            fields.push(
                <div className="gf-form">
                    <InlineFormLabel width={10}>Value field {i}</InlineFormLabel>
                    <Select
                        width={15}
                        placeholder={'(none)'}
                        defaultValue={0}
                        options={allNumberFields.map((f) => ({
                            label: fieldLabel(f),
                            value: f.name,
                        }))}
                        value={{ label: valueField, value: valueField }}
                        allowCustomValue={false}
                        onChange={this.onValueFieldChange(i)}
                    />
                    <Button value={i} onClick={this.onRemoveField(i)}>
                        Remove
                    </Button>
                </div>
            );
        }
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
                    <FormField
                        label="Prefix"
                        labelWidth={10}
                        inputWidth={30}
                        onChange={this.onPrefixChange}
                        value={prefix}
                        placeholder="http://arango:8529"
                    />
                </div>
                <div className="gf-form">
                    <InlineFormLabel width={10}>Timestamp field</InlineFormLabel>
                    <Select
                        width={30}
                        placeholder={'(none)'}
                        defaultValue={0}
                        options={allTimeFields.map((f) => ({
                            label: fieldLabel(f),
                            value: f.name,
                        }))}
                        value={{ label: timestampField, value: timestampField }}
                        allowCustomValue={true}
                        onChange={this.onTimestampFieldChange}
                    />
                </div>
                {fields}
                <Button onClick={this.onAddField}>Add field</Button>
            </div>
        );
    }
}
