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
- If needed - perform local deployment for testing before deploying to the testnet/mainnet
  `npm run deploy-local`

## Deployment
[Subgraph Docs](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-studio/)

- Generate static build
  `npm run build`
- Authorize for deployment. You can get `<DEPLOY KEY>` from the [Subgraph Studio](https://thegraph.com/studio/subgraph/fractal-test/)
  `graph auth --studio <DEPLOY KEY>`
- Actually, deploy
  `npm run deploy`. It will prompt you for version - make sure to fill this one with something meaningful and based on previous versioning convention (usually something like vX.X.X-<patch-name>)

## Architecture

There're 3 main parts of this repository:
- [GraphQL Schema](./schema.graphql): used to define schema of entitines that are stored in Subgraph.
- [Subgraph Config](./subgraph.yaml): central place of configuration of The Graph service. Used to define handlers and data source (aka smart contracts to read events from). Also, defines which handlers to call in regard of events
- [Handlers](./src): actual code, where you define handlers and how they react to events (creating/updating/deleting entities)