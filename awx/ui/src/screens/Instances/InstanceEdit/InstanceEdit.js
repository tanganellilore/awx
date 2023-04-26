import React, { useState, useCallback, useEffect } from 'react';

import { t } from '@lingui/macro';
import { useHistory, useParams, Link } from 'react-router-dom';

import useRequest from 'hooks/useRequest';
import ContentError from 'components/ContentError';
import ContentLoading from 'components/ContentLoading';
import { CardBody } from 'components/Card';
import { InstancesAPI } from 'api';
import InstanceForm from '../Shared/InstanceForm';

function InstanceEdit({ setBreadcrumb }) {
  const history = useHistory();

  const { id } = useParams();
  const [submitError, setSubmitError] = useState(null);
  const detailsUrl = `/instances/${id}/details`;

  const isEdit = true;

  const handleSubmit = async (values) => {
    try {
      await InstancesAPI.update(instance.id, values);
      history.push(detailsUrl);
    } catch (error) {
      setSubmitError(error);
    }
  };

  const handleCancel = () => {
    history.push(detailsUrl);
  };

  const {
    isLoading,
    error,
    request: fetchDetail,
    result: { instance },
  } = useRequest(
    useCallback(async () => {
      const [{ data: instance_detail }] = await Promise.all([
        InstancesAPI.readDetail(id),
      ]);
      return {
        instance: instance_detail,
      };
    }, [id]),
    {
      instance: {},
    }
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    setBreadcrumb(instance.hostname);
  }, [instance, setBreadcrumb]);

  if (isLoading) {
    return (
      <CardBody>
        <ContentLoading />
      </CardBody>
    );
  }

  if (error) {
    return (
      <CardBody>
        <ContentError error={error}>
          {error?.response?.status === 404 && (
            <span>
              {t`Instance not found.`}{' '}
              <Link to="/instances">{t`View all Instances.`}</Link>
            </span>
          )}
        </ContentError>
      </CardBody>
    );
  }

  return (
    <CardBody>
      <InstanceForm
        instance={instance}
        onSubmit={handleSubmit}
        submitError={submitError}
        onCancel={handleCancel}
        isEdit={isEdit}
      />
    </CardBody>
  );
}

export default InstanceEdit;