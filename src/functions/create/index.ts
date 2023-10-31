import { app, output, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { FnolEntity } from "../../models/fnol";
import { v4 as uuidv4 } from 'uuid';

const tableOutput = output.table({
    tableName: 'fnoldatatable',
    connection: 'AzureWebJobsStorage',
});

export async function create(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const fnol = (await request.json()) || null;
        if (fnol) {
            const fnolEntity: FnolEntity = {
                PartitionKey: new Date().toDateString(),
                RowKey: uuidv4(),
                Data: JSON.stringify(fnol),
            };

            context.extraOutputs.set(tableOutput, fnolEntity);

            return {
                status: 201,
                headers: {
                    'Location': `/fnol/${fnolEntity.RowKey}`
                }
            };
        }
        return {
            status: 400
        };
    } catch (e) {
        context.log('Error: ' + e);
        return {
            status: 500
        };
    }
};

app.http('create', {
    route: "fnol",
    methods: ['POST'],
    extraOutputs: [tableOutput],
    handler: create
});
