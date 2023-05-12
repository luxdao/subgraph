# Fractal Subgraph

## Development

- Clone repo 
  `git clone https://github.com/decent-dao/fractal-subgraph`
- Instal CLI
  `npm install -g @graphprotocol/graph-cli`
- Install dependencies
  `npm i`
- Generate types and entities
  `npm run codegen`
- If needed - perform local deployment for testing before deploying to the testnet/mainnet. Note - this is quite heavy and requires powerful machine as you'll need to have local IPFS and Graph Node running.
  `npm run deploy-local`

## Deployment
[Subgraph Docs](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-studio/#deploying-a-subgraph-to-subgraph-studio)

- Generate static build
  `npm run build`
- Authorize for deployment. `graph auth --studio <DEPLOY KEY>` You can get `<DEPLOY KEY>` from the Subgraph Studio:
  - [Subgraph Studio - Goerli Instance](https://thegraph.com/studio/subgraph/fractal-test/)
  - [Subgraph Studio - Sepolia Instance](https://thegraph.com/studio/subgraph/fractal-sepolia/)
  - [Subgraph Studio - Mainnet Instance](https://thegraph.com/studio/subgraph/fractal/)
- Actually, deploy `npm run deploy:<network>`. It will prompt you for version - make sure to fill this one with something meaningful and based on previous versioning convention (usually something like `vX.X.X-<patch-name>`)

## Adding network support
- Make sure that network is supported from [Subgraph Studio](https://thegraph.com/docs/en/developing/supported-networks/#hosted-service). Note - the chain might be not listed, but still supported. Check graphprotocol Discord.
- Create `subgraph.<network>.yaml` in the repository root. Copy-paste content from one of existing configuration files. Adjust contract addresses, `network` and `startBlock` fields.
- Create new Subgraph Studio instance from the [Studio](https://thegraph.com/studio/)
- Update `package.json` with `deploy:<network>` script.
- Update `networks.json` file with new `<network>` name pointing to addresses on newly added network.
- Deploy newly created Subgraph instance.
- Update `README.md` to have pointing to the newly created instance.
- Open the PR to merge your changes with all the created/updated configuration into `main` branch.
## Architecture

There're 3 main parts of this repository:
- [GraphQL Schema](./schema.graphql): used to define schema of entitines that are stored in Subgraph.
- [Subgraph Config](./subgraph.yaml): central place of configuration of The Graph service. Used to define handlers and data source (aka smart contracts to read events from). Also, defines which handlers to call in regard of events
- [Handlers](./src): actual code, where you define handlers and how they react to events (creating/updating/deleting entities)