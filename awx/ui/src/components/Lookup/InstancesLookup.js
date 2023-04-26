import React, { useCallback, useEffect } from 'react';
import { arrayOf, string, func, bool } from 'prop-types';
import { withRouter } from 'react-router-dom';
import { t } from '@lingui/macro';
import { FormGroup } from '@patternfly/react-core';
import { InstancesAPI } from 'api';
import { Instance } from 'types';
import { getSearchableKeys } from 'components/PaginatedTable';
import { getQSConfig, parseQueryString } from 'util/qs';
import useRequest from 'hooks/useRequest';
import Popover from '../Popover';
import OptionsList from '../OptionsList';
import Lookup from './Lookup';
import LookupErrorMessage from './shared/LookupErrorMessage';
import FieldWithPrompt from '../FieldWithPrompt';

const QS_CONFIG = getQSConfig('instances', {
  page: 1,
  page_size: 5,
  order_by: 'hostname',
});

function InstancesLookup({
  id,
  value,
  onChange,
  tooltip,
  className,
  required,
  history,
  fieldName,
  validate,
  columns,
  isPromptableField,
  promptId,
  promptName,
}) {
  const {
    result: { instances, count, relatedSearchableKeys, searchableKeys },
    request: fetchInstances,
    error,
    isLoading,
  } = useRequest(
    useCallback(async () => {
      const params = parseQueryString(QS_CONFIG, history.location.search);
      const [{ data }, actionsResponse] = await Promise.all([
        InstancesAPI.read(params),
        InstancesAPI.readOptions(),
      ]);
      return {
        instances: data.results,
        count: data.count,
        relatedSearchableKeys: (
          actionsResponse?.data?.related_search_fields || []
        ).map((val) => val.slice(0, -8)),
        searchableKeys: getSearchableKeys(actionsResponse.data.actions?.GET),
      };
    }, [history.location]),
    {
      instances: [],
      count: 0,
      relatedSearchableKeys: [],
      searchableKeys: [],
    }
  );

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const renderLookup = () => (
    <>
      <Lookup
        id="instances"
        header={t`Instances`}
        value={value}
        onChange={onChange}
        onUpdate={fetchInstances}
        fieldName={fieldName}
        validate={validate}
        qsConfig={QS_CONFIG}
        multiple
        required={required}
        isLoading={isLoading}
        renderOptionsList={({ state, dispatch, canDelete }) => (
          <OptionsList
            value={state.selectedItems}
            options={instances}
            optionCount={count}
            columns={columns}
            searchColumns={[
              {
                name: t`Hostname`,
                key: 'hostname__icontains',
                isDefault: true,
              },
            ]}
            sortColumns={[
              {
                name: t`Hostname`,
                key: 'hostname',
              },
            ]}
            searchableKeys={searchableKeys}
            relatedSearchableKeys={relatedSearchableKeys}
            multiple={state.multiple}
            header={t`Instances`}
            name="instances"
            qsConfig={QS_CONFIG}
            readOnly={!canDelete}
            selectItem={(item) => dispatch({ type: 'SELECT_ITEM', item })}
            deselectItem={(item) => dispatch({ type: 'DESELECT_ITEM', item })}
          />
        )}
      />
      <LookupErrorMessage error={error} />
    </>
  );

  return isPromptableField ? (
    <FieldWithPrompt
      fieldId={id}
      label={t`Instances`}
      promptId={promptId}
      promptName={promptName}
      tooltip={tooltip}
    >
      {renderLookup()}
    </FieldWithPrompt>
  ) : (
    <FormGroup
      className={className}
      label={t`Instances`}
      labelIcon={tooltip && <Popover content={tooltip} />}
      fieldId={id}
    >
      {renderLookup()}
    </FormGroup>
  );
}

InstancesLookup.propTypes = {
  id: string,
  value: arrayOf(Instance).isRequired,
  tooltip: string,
  onChange: func.isRequired,
  className: string,
  required: bool,
  validate: func,
  fieldName: string,
  columns: arrayOf(Object),
};

InstancesLookup.defaultProps = {
  id: 'instances',
  tooltip: '',
  className: '',
  required: false,
  validate: () => undefined,
  fieldName: 'instances',
  columns: [{
    key: 'hostname',
    name: t`Hostname`
  }]  
};

export default withRouter(InstancesLookup);
