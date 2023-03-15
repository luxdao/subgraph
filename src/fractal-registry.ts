import { Bytes } from "@graphprotocol/graph-ts";
import {
  FractalNameUpdated as FractalNameUpdatedEvent,
  FractalSubDAODeclared as FractalSubDAODeclaredEvent
} from "../generated/FractalRegistry/FractalRegistry"
import { DAO } from "../generated/schema"

const loadOrCreateDAO = (address: Bytes): DAO => {
  let dao = DAO.load(address); // Using address as ID
  if (!dao) {
    dao = new DAO(address)
    dao.address = address; // But also keep address field on DAO entity in case we would want to use something else as ID
    dao.hierarchy = [];
  }

  return dao;
}

export function handleFractalNameUpdated(event: FractalNameUpdatedEvent): void {
  let dao = loadOrCreateDAO(event.params.daoAddress);
  dao.name = event.params.daoName;

  dao.save();
}

export function handleFractalSubDAODeclared(event: FractalSubDAODeclaredEvent): void {
  let subDAO = loadOrCreateDAO(event.params.subDAOAddress);
  subDAO.parentAddress = event.params.parentDAOAddress;
  subDAO.save();

  let parentDAO = loadOrCreateDAO(event.params.parentDAOAddress);
  let hierarchy = parentDAO.hierarchy;
  hierarchy.push(subDAO.id);
  parentDAO.hierarchy = hierarchy;

  parentDAO.save();
}

