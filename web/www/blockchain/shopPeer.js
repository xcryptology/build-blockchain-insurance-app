'use strict';

import config from './config';
import { wrapError, marshalArgs } from './utils';
import { shopClient as client, isReady } from './setup';
import uuidV4 from 'uuid/v4';

import network from './invoke';

export async function getContractTypes(shopType) {
  if (!isReady()) {
    return;
  }
  try {
    return await query('contract_type_ls', { shopType });
  } catch (e) {
    throw wrapError(
      `Error getting contract types for shop type ${shopType} : ${e.message}`
      , e);
  }
}

export async function createContract(contract) {
  if (!isReady()) {
    return;
  }
  try {
    console.log(`contract before ojbect.assign: ${contract}`)
    let c = Object.assign({}, contract, { uuid: uuidV4() });
    console.log(`contract after object.assign: ${c}`)
    const loginInfo = await invoke('contract_create', c);
    if (!loginInfo
      ^ !!(loginInfo && loginInfo.username && loginInfo.password)) {
      return Object.assign(loginInfo || {}, { uuid: c.uuid });
    } else {
      throw new Error(loginInfo);
    }
  } catch (e) {
    throw wrapError(`Error creating contract: ${e.message}`, e);
  }
}

export async function createUser(user) {
  if (!isReady()) {
    return;
  }
  try {
    const loginInfo = await invoke('user_create', user);
    if (!loginInfo ^
      !!(loginInfo && loginInfo.username && loginInfo.password)) {
      return loginInfo;
    } else {
      throw new Error(loginInfo);
    }
  } catch (e) {
    throw wrapError(`Error creating user: ${e.message}`, e);
  }
}

export async function authenticateUser(username, password) {
  if (!isReady()) {
    return;
  }
  try {
    let authenticated =
      await query('user_authenticate', { username, password });
    if (authenticated === undefined || authenticated === null) {
      throw new Error('Unknown error, invalid response!');
    }
    return authenticated;
  } catch (e) {
    throw wrapError(`Error authenticating user: ${e.message}`, e);
  }
}

export async function getUserInfo(username) {
  if (!isReady()) {
    return;
  }
  try {
    const user = await query('user_get_info', { username });
    return user;
  } catch (e) {
    throw wrapError(`Error getting user info: ${e.message}`, e);
  }
}

export function getBlocks(noOfLastBlocks) {
  return client.getBlocks(noOfLastBlocks);
}

export const on = client.on.bind(client);
export const once = client.once.bind(client);
export const addListener = client.addListener.bind(client);
export const prependListener = client.prependListener.bind(client);
export const removeListener = client.removeListener.bind(client);

const peerType = 'insuranceUser'

async function invoke(fcn, ...args) {
  //using the new programming model
  await network.invokeCC(fcn, ...args);

  console.log('after calling await network.invokeCC(fcn, ...args)')

  return client.invoke(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);

}

async function query(fcn, ...args) {

  // await network.invokeCC(fcn, ...args);

  console.log('after calling await network.queryCC(fcn, ...args)')

  return client.query(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}
