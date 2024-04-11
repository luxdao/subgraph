# Fractal Subgraph

## Development

- Clone repo
  `git clone https://github.com/decent-dao/fractal-subgraph`
- Install dependencies
  `npm install`
- Generate types and entities (this will generate types and entities based on the schema and handlers defined in the subgraph.yaml file)
  `npm run codegen -f subgraph.<network>.yaml`

## Adding network support

- Make sure that network is supported from [Subgraph Studio](https://thegraph.com/docs/en/developing/supported-networks/#hosted-service). Note - the chain might be not listed, but still supported. Check graphprotocol Discord.
- Create `subgraph.<network>.yaml` in the repository root. Copy-paste content from one of existing configuration files. Adjust contract `address`es, `network` and `startBlock` fields.
- Create new Subgraph Studio instance from the [Studio](https://thegraph.com/studio/)
- Update `package.json` with `deploy:<network>` script.
- Deploy newly created Subgraph instance (see next section).
- Open the PR to merge your changes with all the created/updated configuration into `main` branch.

## Deployment

[Subgraph Docs](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-studio/#deploying-a-subgraph-to-subgraph-studio)

- Generate static build
  `npm run build -f subgraph.<network>.yaml`
- Authorize for deployment. `graph auth --studio <DEPLOY KEY>` You can get `<DEPLOY KEY>` from the Subgraph Studio.
- Actually deploy with `npm run deploy:<network>`. It will prompt you for version - make sure to fill this one with something meaningful and based on previous versioning convention (usually something like `vX.X.X-<patch-name>`)

## Architecture

There're 3 main parts of this repository:

- [GraphQL Schema](./schema.graphql): used to define schema of entitines that are stored in Subgraph.
- [Subgraph Config](./subgraph.yaml): central place of configuration of The Graph service. Used to define handlers and data source (aka smart contracts to read events from). Also, defines which handlers to call in regard of events
- [Handlers](./src): actual code, where you define handlers and how they react to events (creating/updating/deleting entities)
