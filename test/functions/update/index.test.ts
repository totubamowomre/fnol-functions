import { HttpRequest, InvocationContext } from '@azure/functions';
import { update } from '../../../src/functions/update';

jest.mock('@azure/data-tables', () => {
  const mockGetEntity = jest.fn().mockResolvedValue({
    partitionKey: 'testPartitionKey',
    rowKey: 'testRowKey',
    Data: '{}',
    Status: 'New',
  });
  const mockUpdateEntity = jest.fn().mockResolvedValue({});

  const mockTableClientInstance = {
    getEntity: mockGetEntity,
    updateEntity: mockUpdateEntity,
  };

  return {
    TableClient: {
      fromConnectionString: jest.fn(() => mockTableClientInstance),
    },
  };
});

import { TableClient } from '@azure/data-tables';

describe('update function', () => {
  let request: HttpRequest;
  let context: InvocationContext;

  beforeEach(() => {
    request = {
      method: 'PUT',
      url: 'http://localhost:7071/api/fnol/mock-id',
      params: { id: 'mock-id' },
      json: jest.fn(),
    } as never;
    context = {
      log: jest.fn(),
    } as never;
  });

  it('should update valid data and return 200', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce({
      reporter: {
        firtName: 'firtName',
        lastName: 'lastName',
      },
    });

    const response = await update(request, context);

    expect(response.status).toBe(200);
  });

  it('should return 404 for invalid request param', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce({
      reporter: {
        firtName: 'firtName',
        lastName: 'lastName',
      },
    });

    const mockGetEntity = TableClient.fromConnectionString('', '').getEntity as jest.Mock;

    mockGetEntity.mockResolvedValueOnce(undefined);

    const response = await update(request, context);

    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce(null);

    const response = await update(request, context);

    expect(response.status).toBe(400);
  });
});
