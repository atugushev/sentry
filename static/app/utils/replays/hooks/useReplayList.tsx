import {useCallback, useEffect, useState} from 'react';
import * as Sentry from '@sentry/react';

import type {Organization} from 'sentry/types';
import EventView from 'sentry/utils/discover/eventView';
import {decodeInteger} from 'sentry/utils/queryString';
import {mapResponseToReplayRecord} from 'sentry/utils/replays/replayDataUtils';
import type RequestError from 'sentry/utils/requestError/requestError';
import useApi from 'sentry/utils/useApi';
import {useLocation} from 'sentry/utils/useLocation';
import type {ReplayListLocationQuery, ReplayListRecord} from 'sentry/views/replays/types';

const DEFAULT_LIMIT = 50;
export const DEFAULT_SORT = '-startedAt';

export const REPLAY_LIST_FIELDS = [
  'countErrors',
  'duration',
  'finishedAt',
  'id',
  'projectId',
  'startedAt',
  'urls',
  'user',
];

type Options = {
  eventView: EventView;
  organization: Organization;
  defaultLimit?: number;
};

type State = {
  fetchError: undefined | RequestError;
  isFetching: boolean;
  pageLinks: null | string;
  replays: undefined | ReplayListRecord[];
};

type Result = State;

function useReplayList({
  eventView,
  organization,
  defaultLimit = DEFAULT_LIMIT,
}: Options): Result {
  const api = useApi();
  const location = useLocation<ReplayListLocationQuery>();

  const [data, setData] = useState<State>({
    fetchError: undefined,
    isFetching: true,
    pageLinks: null,
    replays: [],
  });

  const init = useCallback(async () => {
    try {
      setData(prev => ({
        ...prev,
        isFetching: true,
      }));

      const queryLimit = decodeInteger(location.query.limit, defaultLimit);
      const queryOffset = decodeInteger(location.query.offset, 0);

      const path = `/organizations/${organization.slug}/replays/`;
      const query = eventView.generateQueryStringObject();

      query.limit = String(queryLimit);
      query.offset = String(queryOffset);
      const [{data: records}, _textStatus, resp] = await api.requestPromise(path, {
        includeAllArgs: true,
        query: eventView.getEventsAPIPayload(location),
      });

      const pageLinks = resp?.getResponseHeader('Link') ?? '';

      setData({
        fetchError: undefined,
        isFetching: false,
        pageLinks,
        replays: records.map(mapResponseToReplayRecord),
      });
    } catch (error) {
      Sentry.captureException(error);
      setData({
        fetchError: error,
        isFetching: false,
        pageLinks: null,
        replays: [],
      });
    }
  }, [api, organization, defaultLimit, location, eventView]);

  useEffect(() => {
    init();
  }, [init]);

  return data;
}

export default useReplayList;