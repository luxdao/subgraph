import { log } from '@graphprotocol/graph-ts';
import { ValueUpdated as ValueUpdatedEvent } from '../generated/KeyValuePairs/KeyValuePairs';
import { DAO } from '../generated/schema';

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  if (event.params.key == 'proposalTemplates') {
    let dao = DAO.load(event.params.theAddress);
    if (dao) {
      log.info('Processing proposal templates for DAO: {}, the IPFS hash is: {}', [
        event.params.theAddress.toHexString(),
        event.params.value,
      ]);
      dao.proposalTemplatesHash = event.params.value;
      dao.save();
    }
  } else if (event.params.key == 'snapshotENS') {
    let dao = DAO.load(event.params.theAddress);
    if (dao) {
      log.info('Processing Snapshot ENS for DAO: {}, the ENS is: {}', [
        event.params.theAddress.toHexString(),
        event.params.value,
      ]);
      dao.snapshotENS = event.params.value;
      dao.save();
    }
  } else {
    log.warning('Unknown key: {}', [event.params.key]);
  }
}
