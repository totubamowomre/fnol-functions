import { HttpRequest, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from 'uuid';
import { create } from "../../../src/functions/create";

// Mock uuidv4 function
jest.mock('uuid', () => {
  return {
    v4: jest.fn()
  };
});

describe('create function', () => {
  let request: HttpRequest;
  let context: InvocationContext;

  beforeEach(() => {
    request = {
      method: 'POST',
      url: 'http://localhost:7071/api/fnol',
      json: jest.fn()
    } as any;
    context = {
      log: jest.fn(),
      extraOutputs: {
        set: jest.fn()
      }
    } as any;

    (uuidv4 as jest.Mock).mockReturnValue('mocked-uuid');
  });

  it('should process valid data and return 201', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce({
      reporter: {
        firtName: 'firtName',
        lastName: 'lastName'
      }
    });

    const response = await create(request, context);

    expect(response.status).toBe(201);
    expect(response.headers && response.headers['Location']).toBe(`/fnol/mocked-uuid`);
    expect(context.extraOutputs.set).toHaveBeenCalled();
  });

  it('should return 400 for invalid data', async () => {
    (request.json as jest.Mock).mockResolvedValueOnce(null);

    const response = await create(request, context);

    expect(response.status).toBe(400);
  });
});