# n8n-nodes-virtual-marketer

![Virtual Marketer](https://raw.githubusercontent.com/SGS-Virtual-Marketer-GmbH/n8n-nodes-virtual-marketer/main/nodes/VirtualMarketer/virtualMarketer.png)

This is an [n8n](https://n8n.io/) community node. It lets you use the **[Virtual Marketer](https://virtual-marketer.de)** AI platform in your n8n workflows.

Virtual Marketer generates AI-powered marketing text based on your configured AI models. With this node you can generate text, list your available AI models, and check your monthly word usage — all directly from n8n.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Usage](#usage) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n documentation.

In short, in your n8n instance:

1. Go to **Settings → Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-virtual-marketer` and confirm.

The node will then be available in the node panel as **Virtual Marketer**.

## Credentials

You need an **X-AUTH-TOKEN** from Virtual Marketer. This token is generated when your installation is complete — keep it secret.

1. In n8n create a new **Virtual Marketer API** credential.
2. Paste your API token.
3. (Optional) Adjust the base URL — defaults to `https://api.virtual-marketer.de`.
4. Use the **Test** button to verify the token works.

## Operations

### AI Generation

- **Generate** — Generate AI-powered text for a chosen model and input text.
  - **Model** — loaded automatically as a dropdown from your account once the credential is set.
  - **Input Text (Segment)** — the query / text to process.
  - **Session ID** *(optional)* — for conversation tracking.
  - **Processing Type** *(optional)* — `default` or `stream`.

### Model

- **List** — Retrieve all available AI models configured for your account.

### Usage

- **Get Word Count** — Retrieve the number of words generated in the current month.

## Usage

A typical flow: add the **Virtual Marketer** node, select **AI Generation → Generate**, pick an AI model from the preloaded dropdown, enter your input text, and run. The generated text is returned in the `text` field along with a `finish_reason`.

This node is also usable as an [AI tool](https://docs.n8n.io/advanced-ai/) in agent workflows.

## Resources

- [Virtual Marketer website](https://virtual-marketer.de)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE) © SGS Virtual Marketer GmbH — info@virtual-marketer.de
