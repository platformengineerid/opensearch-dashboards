/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { createUpdateRoute } from './update';
import { MockServer } from './_mock_server';

describe('PUT /api/saved_objects/{type}/{id?}', () => {

  const savedObjectsClient = { update: jest.fn() };
  let server;

  beforeEach(() => {
    server = new MockServer();
    savedObjectsClient.update.mockImplementation(() => Promise.resolve(true));

    const prereqs = {
      getSavedObjectsClient: {
        assign: 'savedObjectsClient',
        method() {
          return savedObjectsClient;
        }
      },
    };

    server.route(createUpdateRoute(prereqs));
  });

  afterEach(() => {
    savedObjectsClient.update.mockReset();
  });

  it('formats successful response', async () => {
    const request = {
      method: 'PUT',
      url: '/api/saved_objects/index-pattern/logstash-*',
      payload: {
        attributes: {
          title: 'Testing'
        },
        references: [],
      }
    };

    const clientResponse = {
      id: 'logstash-*',
      title: 'logstash-*',
      timeFieldName: '@timestamp',
      notExpandable: true,
      references: [],
    };

    savedObjectsClient.update.mockImplementation(() => Promise.resolve(clientResponse));

    const { payload, statusCode } = await server.inject(request);
    const response = JSON.parse(payload);

    expect(statusCode).toBe(200);
    expect(response).toEqual(clientResponse);
  });

  it('calls upon savedObjectClient.update', async () => {
    const request = {
      method: 'PUT',
      url: '/api/saved_objects/index-pattern/logstash-*',
      payload: {
        attributes: { title: 'Testing' },
        version: 'foo',
      }
    };

    await server.inject(request);

    expect(savedObjectsClient.update).toHaveBeenCalledWith(
      'index-pattern',
      'logstash-*',
      { title: 'Testing' },
      { version: 'foo', references: [] }
    );
  });
});
