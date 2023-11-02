import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { TableClient } from '@azure/data-tables';
import { FnolEntity } from '../../models/fnol';

const connectionString: string =
  process.env && process.env['APPSETTING_AzureWebJobsStorage'] ? process.env['APPSETTING_AzureWebJobsStorage'] : 'UseDevelopmentStorage=true';
const serviceClient = TableClient.fromConnectionString(connectionString, 'fnoldatatable');

export async function update(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const fnol = (await request.json()) || null;
    if (fnol) {
      const fnolEntity = await serviceClient.getEntity<FnolEntity>(new Date().toISOString().split('T')[0], request.params.id);
      if (fnolEntity && fnolEntity.partitionKey && fnolEntity.rowKey) {
        await serviceClient.updateEntity({
          partitionKey: fnolEntity.partitionKey,
          rowKey: fnolEntity.rowKey,
          Data: JSON.stringify(fnol),
          Status: 'Submitted',
        });

        return {
          status: 200,
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
});
