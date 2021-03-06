// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  'app',
  'api',
  'addons/documents/changes/actiontypes',
  'addons/documents/changes/stores',
  'addons/documents/helpers'
],
function (app, FauxtonAPI, ActionTypes, Stores, Helpers) {

  var changesStore = Stores.changesStore;
  var pollingTimeout = 60000;
  var currentRequest;


  return {
    toggleTabVisibility: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.TOGGLE_CHANGES_TAB_VISIBILITY
      });
    },

    addFilter: function (filter) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
        filter: filter
      });
    },

    removeFilter: function (filter) {
      FauxtonAPI.dispatch({
        type: ActionTypes.REMOVE_CHANGES_FILTER_ITEM,
        filter: filter
      });
    },

    initChanges: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.INIT_CHANGES,
        options: options
      });
      currentRequest = null;
      this.getLatestChanges();
    },

    getLatestChanges: function () {
      var params = {
        limit: 100
      };

      // after the first request for the changes list has been made, switch to longpoll
      if (currentRequest) {
        params.since = changesStore.getLastSeqNum();
        params.timeout = pollingTimeout;
        params.feed = 'longpoll';
      }

      var query = $.param(params);
      var db = app.utils.safeURLName(changesStore.getDatabaseName());

      var endpoint = FauxtonAPI.urls('changes', 'server', db, '');
      currentRequest = $.getJSON(endpoint);
      currentRequest.then(_.bind(this.updateChanges, this));
    },

    updateChanges: function (json) {
      // only bother updating the list of changes if the seq num has changed
      var latestSeqNum = Helpers.getSeqNum(json.last_seq);
      if (latestSeqNum !== changesStore.getLastSeqNum()) {
        FauxtonAPI.dispatch({
          type: ActionTypes.UPDATE_CHANGES,
          changes: json.results,
          seqNum: latestSeqNum
        });
      }

      if (changesStore.pollingEnabled()) {
        this.getLatestChanges();
      }
    },

    togglePolling: function () {
      FauxtonAPI.dispatch({ type: ActionTypes.TOGGLE_CHANGES_POLLING });

      // the user just enabled polling. Start 'er up
      if (changesStore.pollingEnabled()) {
        this.getLatestChanges();
      } else {
        currentRequest.abort();
      }
    }
  };

});
