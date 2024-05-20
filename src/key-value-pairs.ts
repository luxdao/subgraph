import { log } from '@graphprotocol/graph-ts';
import { ValueUpdated as ValueUpdatedEvent } from '../generated/KeyValuePairs/KeyValuePairs';
import { loadOrCreateDAO } from './shared';

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  if (event.params.key == 'proposalTemplates') {
    const dao = loadOrCreateDAO(event.params.theAddress);
    dao.proposalTemplatesHash = event.params.value;
    dao.save();
  } else if (event.params.key == 'snapshotENS') {
    const dao = loadOrCreateDAO(event.params.theAddress);
    dao.snapshotENS = event.params.value;
    dao.save();
  } else {
    log.warning('Unknown key: {}', [event.params.key]);
  }
}
