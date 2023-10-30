import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from 'uuid';

interface BindingContext extends InvocationContext {
    bindings: { [key: string]: any };
}

interface FnolEntity {
    PartitionKey: string;
    RowKey: string;
    Data: IFnolData;
}

interface IFnolData {
    reporter: {
        firstname: string,
        lastname: string
    },
    policy: {
        policyNumber: string
    },
    loss: {
        lossDate: string
    }
}

export async function create(context: InvocationContext, request: HttpRequest): Promise<HttpResponseInit> {
    const payload = parsePayload(request.body);
    if (payload) {
        const payload: IFnolData = request.body as unknown as IFnolData;
        const fnol: FnolEntity = {
            PartitionKey: new Date().toDateString(),
            RowKey: uuidv4(),
            Data: payload,
        };

        const bindings = (context as BindingContext).bindings;
        context.extraOutputs.set(bindings.tableOutput, fnol);

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

// This is a basic validation, extend with more comprehensive checks with a library
function parsePayload(body: any): IFnolData | null {
    if (
        body &&
        body.reporter &&
        body.reporter.firstname &&
        body.reporter.lastname &&
        body.policy &&
        body.policy.policyNumber &&
        body.loss &&
        body.loss.lossDate
    ) {
        return body as IFnolData;
    }
    return null;
}
