import { app, output, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from 'uuid';


const tableOutput = output.table({
    tableName: 'fnoldatatable',
    connection: 'AzureWebJobsStorage',
});

export interface FnolEntity {
    partitionKey: string;
    rowKey: string;
    data: IFnolData;
}

export interface IFnolData {
    reporter: {
        firstName: string,
        lastName: string
    },
    policy: {
        policyNumber: string
    },
    loss: {
        lossDate: string
    },
    blobLink: string
}

// This is a basic validation, extend with more comprehensive checks with a library
function parsePayload(body: any): IFnolData | null {
    if (
        body &&
        body.reporter &&
        body.reporter.firstName &&
        body.reporter.lastName &&
        body.policy &&
        body.policy.policyNumber &&
        body.loss &&
        body.loss.lossDate
    ) {
        return body as IFnolData;
    }
    return null;
}

export async function create(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const data = parsePayload((await request.json()) || null);
    if (data) {
        const fnol: FnolEntity = {
            partitionKey: new Date().toDateString(),
            rowKey: uuidv4(),
            data: data,
        };

        context.extraOutputs.set(tableOutput, fnol);

        return {
            status: 201,
            jsonBody: fnol
        };
    }
    return {
        status: 400,
        jsonBody: {
            errorCode: "400",
            message: "Invalid request payload"
        }
    };

};

app.http('create', {
    methods: ['POST'],
    extraOutputs: [tableOutput],
    handler: create
});
