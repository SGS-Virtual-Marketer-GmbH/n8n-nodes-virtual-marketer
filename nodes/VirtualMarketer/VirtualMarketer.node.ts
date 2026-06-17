import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { JsonObject } from 'n8n-workflow';

const CREDENTIAL_NAME = 'virtualMarketerApi';

/**
 * Performs an authenticated request against the Virtual Marketer API.
 * The base URL and X-AUTH-TOKEN are injected from the credential.
 */
async function vmRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials(CREDENTIAL_NAME);
	const baseUrl = ((credentials.baseUrl as string) || 'https://api.virtual-marketer.de').replace(
		/\/$/,
		'',
	);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};
	if (body !== undefined) {
		options.body = body;
	}

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		CREDENTIAL_NAME,
		options,
	)) as IDataObject;
}

export class VirtualMarketer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Virtual Marketer',
		name: 'virtualMarketer',
		icon: { light: 'file:virtualMarketer.png', dark: 'file:virtualMarketer.png' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate AI marketing text, list products and check word usage with Virtual Marketer',
		defaults: {
			name: 'Virtual Marketer',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: CREDENTIAL_NAME,
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'AI Generation',
						value: 'ai',
						description: 'Generate AI-powered text',
					},
					{
						name: 'Model',
						value: 'product',
						description: 'List the available AI models',
					},
					{
						name: 'Usage',
						value: 'usage',
						description: 'Check word usage of your account',
					},
				],
				default: 'ai',
			},

			// ----------------------------------
			//            AI operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ai'],
					},
				},
				options: [
					{
						name: 'Generate',
						value: 'generate',
						action: 'Generate AI text',
						description: 'Generate an AI-powered response for a product and input text',
					},
				],
				default: 'generate',
			},
			{
				displayName: 'Model Name or ID',
				name: 'product',
				type: 'options',
				noDataExpression: false,
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				required: true,
				default: '',
				description:
					'The AI model to use for generation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						resource: ['ai'],
						operation: ['generate'],
					},
				},
			},
			{
				displayName: 'Input Text (Segment)',
				name: 'segment',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				default: '',
				placeholder: 'e.g. Ich suche eine Ultraschallspitze',
				description: 'The input text / query to process',
				displayOptions: {
					show: {
						resource: ['ai'],
						operation: ['generate'],
					},
				},
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['ai'],
						operation: ['generate'],
					},
				},
				options: [
					{
						displayName: 'Session ID',
						name: 'sessionId',
						type: 'string',
						default: '',
						placeholder: 'af1da2b2-20fd-11f0-a9b4-dbccb86419d7',
						description: 'Optional session identifier for conversation tracking (UUID)',
					},
					{
						displayName: 'Processing Type',
						name: 'processingType',
						type: 'options',
						options: [
							{
								name: 'Default',
								value: 'default',
							},
							{
								name: 'Stream',
								value: 'stream',
							},
						],
						default: 'default',
						description: 'How the response should be processed',
					},
				],
			},

			// ----------------------------------
			//          Product operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['product'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						action: 'List all models',
						description: 'Retrieve a list of all available AI models',
					},
				],
				default: 'list',
			},

			// ----------------------------------
			//           Usage operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['usage'],
					},
				},
				options: [
					{
						name: 'Get Word Count',
						value: 'getWordCount',
						action: 'Get current word count',
						description: 'Retrieve the number of words generated in the current month',
					},
				],
				default: 'getWordCount',
			},
		],
	};

	methods = {
		loadOptions: {
			// Preloads the available AI models as a dropdown once the credential is set.
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await vmRequest.call(this, 'POST', '/api/product');
				const models = (response?.products as string[]) ?? [];

				return models.map((model) => ({
					name: model,
					value: model,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject = {};

				if (resource === 'ai' && operation === 'generate') {
					const product = this.getNodeParameter('product', i) as string;
					const segment = this.getNodeParameter('segment', i) as string;
					const additionalOptions = this.getNodeParameter(
						'additionalOptions',
						i,
						{},
					) as IDataObject;

					const body: IDataObject = { product, segment };
					if (additionalOptions.sessionId) {
						body.sessionId = additionalOptions.sessionId;
					}
					if (additionalOptions.processingType) {
						body.processingType = additionalOptions.processingType;
					}

					responseData = await vmRequest.call(this, 'POST', '/api/ai', body);
				} else if (resource === 'product' && operation === 'list') {
					responseData = await vmRequest.call(this, 'POST', '/api/product');
				} else if (resource === 'usage' && operation === 'getWordCount') {
					responseData = await vmRequest.call(this, 'POST', '/api/wc');
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
