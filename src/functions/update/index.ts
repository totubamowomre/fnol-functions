import { app, input, output, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { FnolEntity } from '../../models/fnol';
import { v4 as uuidv4 } from 'uuid';

const tableInput = input.table({
  tableName: 'fnoldatatable',
  partitionKey: new Date().toDateString(),
  rowKey: '{id}',
  connection: 'AzureWebJobsStorage',
});

const tableOutput = output.table({
  tableName: 'fnoldatatable',
  connection: 'AzureWebJobsStorage',
});

export async function update(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const fnol = (await request.json()) || null;
    if (fnol) {
      const result = context.extraInputs.get(tableInput);
      context.log('Result : ' + JSON.stringify(result));
      let fnolEntity: FnolEntity | null = null;
      if (Array.isArray(result) && result.length > 0) {
        fnolEntity = result.find((entity) => entity.RowKey === request.params.id) as FnolEntity;
      }
      if (fnolEntity) {
        const fnolEntity: FnolEntity = {
          PartitionKey: new Date().toDateString(),
          RowKey: uuidv4(),
          Data: JSON.stringify(fnol),
          Status: 'Submitted',
        };

        context.extraOutputs.set(tableOutput, fnolEntity);

        return {
          status: 200,
          headers: {
            Location: `/fnol/${fnolEntity.RowKey}`,
          },
        };
      }
      return {
        status: 404,
      };
    }
    return {
      status: 400,
    };
  } catch (e) {
    context.log('Error: ' + e);
    return {
      status: 500,
    };
  }
}

app.http('update', {
  route: 'fnol/{id}',
  handler: update,
  methods: ['PUT'],
  extraInputs: [tableInput],
  extraOutputs: [tableOutput],
});
