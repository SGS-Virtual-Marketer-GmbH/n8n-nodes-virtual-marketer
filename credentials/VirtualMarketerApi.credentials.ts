import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class VirtualMarketerApi implements ICredentialType {
	name = 'virtualMarketerApi';

	displayName = 'Virtual Marketer API';

	documentationUrl = 'https://virtual-marketer.de';

	icon = { light: 'file:../nodes/VirtualMarketer/virtualMarketer.png', dark: 'file:../nodes/VirtualMarketer/virtualMarketer.png' } as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your Virtual Marketer X-AUTH-TOKEN. This is provided by Virtual Marketer when your installation is complete. Keep it secret.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.virtual-marketer.de',
			required: true,
			description: 'Base URL of the Virtual Marketer API. Only change this if instructed to.',
		},
	];

	// Sends the token on every request made with this credential.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-AUTH-TOKEN': '={{$credentials.apiToken}}',
			},
		},
	};

	// Used by n8n's "Test" button — hits the product list endpoint to verify the token.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/product',
			method: 'POST',
		},
	};
}
