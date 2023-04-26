import React from 'react';
import { act } from 'react-dom/test-utils';
import { createMemoryHistory } from 'history';

import { InstancesAPI } from 'api';
import { mountWithContexts } from '../../../../testUtils/enzymeHelpers';

import Instance from './InstanceEdit';

jest.mock('../../../api');

const instanceData = {
  id: 42,
  type: 'instances',
  url: '/api/v2/instances/42/',
  related: {
    jobs: '/api/v2/instances/42/jobs/',
    instances: '/api/v2/Instances/7/instances/',
  },
  name: 'Foo',
  created: '2020-07-21T18:41:02.818081Z',
  modified: '2020-07-24T20:32:03.121079Z',
  capacity: 24,
  committed_capacity: 0,
  consumed_capacity: 0,
  percent_capacity_remaining: 100.0,
  jobs_running: 0,
  jobs_total: 0,
  instances: 1,
  controller: null,
  is_container_group: false,
  credential: null,
  policy_instance_percentage: 46,
  policy_instance_minimum: 12,
  policy_instance_list: [],
  pod_spec_override: '',
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: true,
    },
  },
  peers_from_control_nodes: false,
};

const updatedInstance = {
  peers_from_control_nodes: true,
};

describe('<Instance>', () => {
  let wrapper;
  let history;

  beforeAll(async () => {
    history = createMemoryHistory();
    await act(async () => {
      wrapper = mountWithContexts(
        <Instance instanceGroup={instanceGroupData} />,
        {
          context: { router: { history } },
        }
      );
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('handleSubmit should call the api and redirect to details page', async () => {
    await act(async () => {
      wrapper.find('InstanceForm').invoke('onSubmit')(updatedInstance);
    });
    expect(InstancesAPI.update).toHaveBeenCalledWith(42, updatedInstance);
  });

  test('should navigate to instance group details when cancel is clicked', async () => {
    await act(async () => {
      wrapper.find('button[aria-label="Cancel"]').prop('onClick')();
    });
    expect(history.location.pathname).toEqual('/Instances/42/details');
  });

  test('should navigate to instance group details after successful submission', async () => {
    await act(async () => {
      wrapper.find('InstanceForm').invoke('onSubmit')(updatedInstance);
    });
    wrapper.update();
    expect(wrapper.find('FormSubmitError').length).toBe(0);
    expect(history.location.pathname).toEqual('/Instances/42/details');
  });

  test('failed form submission should show an error message', async () => {
    const error = {
      response: {
        data: { detail: 'An error occurred' },
      },
    };
    InstancesAPI.update.mockImplementationOnce(() => Promise.reject(error));
    await act(async () => {
      wrapper.find('InstanceForm').invoke('onSubmit')(updatedInstance);
    });
    wrapper.update();
    expect(wrapper.find('FormSubmitError').length).toBe(1);
  });
});
