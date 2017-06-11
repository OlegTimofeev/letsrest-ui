import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import { cancel, put, call, take, select, takeLatest } from 'redux-saga/effects';
import request from 'utils/request';
import {
  SEND_EXEC_REQUEST,
  SEND_GET_REQUEST_LIST,
  sendExecRequestSuccess,
  sendExecRequestError,
  sendGetRequestList,
  sendGetRequestListSuccess,
  sendGetRequestListError,
} from './actions';
import { makeSelectRequest } from './selectors';

function* sendCreateRequest() {
  const requestURL = '/api/v1/requests';
  const method = 'POST';
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'somename',
    }),
  };

  return yield call(request, requestURL, options);
}

export function* sendExecRequest() {
  let req = yield select(makeSelectRequest());
  if (!req.get('id')) {
    try {
      const created = yield call(sendCreateRequest);
      req = req.set('id', created.id);
      yield put(sendGetRequestList());
    } catch (err) {
      yield put(sendExecRequestError(err));
      return;
    }
  }
  const requestURL = `/api/v1/requests/${req.get('id')}`;
  const method = 'PUT';
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.get('data')),
  };

  try {
    const json = yield call(request, requestURL, options);
    yield put(sendExecRequestSuccess(fromJS(json)));
  } catch (err) {
    yield put(sendExecRequestError(err));
  }
}

export function* sendRequestList() {
  const requestURL = '/api/v1/requests';
  const method = 'GET';
  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  try {
    const json = yield call(request, requestURL, options);
    yield put(sendGetRequestListSuccess(fromJS(json)));
  } catch (err) {
    yield put(sendGetRequestListError(err));
  }
}

export function* sendExecRequestData() {
  const watcher = yield takeLatest(SEND_EXEC_REQUEST, sendExecRequest);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* sendExecRequestListData() {
  const watcher = yield takeLatest(SEND_GET_REQUEST_LIST, sendRequestList);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

// All sagas to be loaded
export default [
  sendExecRequestData,
  sendExecRequestListData,
];
