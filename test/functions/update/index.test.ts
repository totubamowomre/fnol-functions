import { HttpRequest, InvocationContext } from '@azure/functions';
import { update } from '../../../src/functions/update';

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
      extraInputs: {
        get: jest.fn(),
      },
      extraOutputs: {
        set: jest.fn(),
      },
    } as never;
  });

  it('should update valid data and return 200', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce({
      reporter: {
        firtName: 'firtName',
        lastName: 'lastName',
      },
    });

    const mockResult = [
      {
        RowKey: 'mock-id',
        data: JSON.stringify({
          reporter: {
            firtName: 'firtName',
            lastName: 'lastName',
          },
        }),
      },
    ];

    (context.extraInputs.get as jest.Mock).mockReturnValueOnce(mockResult);

    const response = await update(request, context);

    expect(response.status).toBe(200);
    expect(context.extraOutputs.set).toHaveBeenCalled();
  });

  it('should return 404 for invalid request param', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce({
      reporter: {
        firtName: 'firtName',
        lastName: 'lastName',
      },
    });

    const mockResult = [
      {
        RowKey: 'another-mock-id',
        data: JSON.stringify({
          reporter: {
            firtName: 'firtName',
            lastName: 'lastName',
          },
        }),
      },
    ];

    (context.extraInputs.get as jest.Mock).mockReturnValueOnce(mockResult);

    const response = await update(request, context);

    expect(response.status).toBe(404);
    expect(context.extraInputs.get).toHaveBeenCalled();
  });

  it('should return 400 for invalid data', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce(null);

    const response = await update(request, context);

    expect(response.status).toBe(400);
  });
});
