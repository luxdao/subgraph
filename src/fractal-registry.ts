import { Bytes } from '@graphprotocol/graph-ts';
import {
  FractalNameUpdated as FractalNameUpdatedEvent,
  FractalSubDAODeclared as FractalSubDAODeclaredEvent,
} from '../generated/FractalRegistry/FractalRegistry';
import { DAO } from '../generated/schema';

const loadOrCreateDAO = (address: Bytes): DAO => {
  const existingDao = DAO.load(address); // Using address as ID
  if (existingDao) {
    return existingDao;
  }

  const newDao = new DAO(address);
  newDao.address = address; // But also keep address field on DAO entity in case we would want to use something else as ID
  newDao.hierarchy = [];
  return newDao;
};

export function handleFractalNameUpdated(event: FractalNameUpdatedEvent): void {
  const dao = loadOrCreateDAO(event.params.daoAddress);
  dao.name = event.params.daoName;
  dao.save();
}

export function handleFractalSubDAODeclared(event: FractalSubDAODeclaredEvent): void {
  const subDAO = loadOrCreateDAO(event.params.subDAOAddress);
  if (subDAO.parentAddress !== null) {
    return;
  }

  subDAO.parentAddress = event.params.parentDAOAddress;
  subDAO.save();

  const parentDAO = loadOrCreateDAO(event.params.parentDAOAddress);
  const hierarchy = parentDAO.hierarchy;
  hierarchy.push(subDAO.id);
  parentDAO.hierarchy = hierarchy;

  parentDAO.save();
}
