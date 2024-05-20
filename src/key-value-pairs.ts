import { log } from '@graphprotocol/graph-ts';
import { ValueUpdated as ValueUpdatedEvent } from '../generated/KeyValuePairs/KeyValuePairs';
import { loadOrCreateDAO } from './shared';

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  switch (event.params.key) {
    case 'proposalTemplates': {
      const dao = loadOrCreateDAO(event.params.theAddress);
      dao.proposalTemplatesHash = event.params.value;
      dao.save();
      break;
    }
    case 'snapshotENS': {
      const dao = loadOrCreateDAO(event.params.theAddress);
      dao.snapshotENS = event.params.value;
      dao.save();
      break;
    }
    default: {
      log.warning('Unknown key: {}', [event.params.key]);
    }
  }
}
