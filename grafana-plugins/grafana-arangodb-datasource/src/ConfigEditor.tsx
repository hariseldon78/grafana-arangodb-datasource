import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions /* MySecureJsonData */ } from './types';

const { /* SecretFormField, */ FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
    onPropChange =
        (propName: keyof MyDataSourceOptions) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const { onOptionsChange, options } = this.props;
            const jsonData: MyDataSourceOptions = {
                ...options.jsonData,
            };
            (jsonData as Record<string, any>)[propName] = event.target.value;
            onOptionsChange({ ...options, jsonData });
        };

    onDbUrlChange = this.onPropChange('dbUrl');
    onDbNameChange = this.onPropChange('dbName');
    onCollectionsRegexChange = this.onPropChange('collectionsRegex');
    componentDidMount() {
        this.props.options.jsonData.collectionsRegex = '.*';
    }
    /*
     *     // Secure field (only sent to the backend)
     *     onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
     *         const { onOptionsChange, options } = this.props;
     *         onOptionsChange({
     *             ...options,
     *             secureJsonData: {
     *                 apiKey: event.target.value,
     *             },
     *         });
     *     };
     *
     *     onResetAPIKey = () => {
     *         const { onOptionsChange, options } = this.props;
     *         onOptionsChange({
     *             ...options,
     *             secureJsonFields: {
     *                 ...options.secureJsonFields,
     *                 apiKey: false,
     *             },
     *             secureJsonData: {
     *                 ...options.secureJsonData,
     *                 apiKey: '',
     *             },
     *         });
     *     };
     *  */

    render() {
        const { options } = this.props;
        const { jsonData /* secureJsonFields */ } = options;
        /* const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData; */

        return (
            <div className="gf-form-group">
                <div className="gf-form">
                    <p>No authentication support for now</p>
                </div>
                <div className="gf-form">
                    <FormField
                        label="Db url"
                        labelWidth={6}
                        inputWidth={20}
                        onChange={this.onDbUrlChange}
                        value={jsonData.dbUrl || ''}
                        placeholder="http://arango:8529"
                    />
                </div>
                <div className="gf-form">
                    <FormField
                        label="Db name"
                        labelWidth={6}
                        inputWidth={20}
                        onChange={this.onDbNameChange}
                        value={jsonData.dbName || ''}
                        placeholder="test_database"
                    />
                </div>
                <div className="gf-form">
                    <FormField
                        label="collectionsRegex"
                        labelWidth={6}
                        inputWidth={20}
                        onChange={this.onDbUrlChange}
                        value={jsonData.collectionsRegex || '.*'}
                        placeholder=".*"
                    />
                </div>
                {/* <div className="gf-form">
                    <FormField
                    label="Path"
                    labelWidth={6}
                    inputWidth={20}
                    onChange={this.onPathChange}
                    value={jsonData.path || ''}
                    placeholder="json field returned to frontend"
                    />
                    </div>

                    <div className="gf-form-inline">
                    <div className="gf-form">
                    <SecretFormField
                    isConfigured={
                    (secureJsonFields && secureJsonFields.apiKey) as boolean
                    }
                    value={secureJsonData.apiKey || ''}
                    label="API Key"
                    placeholder="secure json field (backend only)"
                    labelWidth={6}
                    inputWidth={20}
                    onReset={this.onResetAPIKey}
                    onChange={this.onAPIKeyChange}
                    />
                    </div>
                    </div> */}
            </div>
        );
    }
}
