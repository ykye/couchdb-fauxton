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

module.exports = {

  'Select doc via typeahead field redirects user': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName, 3)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('#jump-to-doc-id', waitTime, false)
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementPresent('#documents-pagination', waitTime, false)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .click('.burger')

      // we need to explicitly show the doc field because it's hidden on Travis due to screen width
      .execute("$('.closeMenu .with-sidebar .searchbox-wrapper').show();")
      .setValue('#jump-to-doc-id', ['_des'])

      .waitForElementPresent('li[data-value="_design/testdesigndoc"]', waitTime, false)
      .waitForElementVisible('li[data-value="_design/testdesigndoc"]', waitTime, false)
      .click('#jump-to-doc .typeahead.dropdown-menu li[data-value="_design/testdesigndoc"]')

      .setValue('#jump-to-doc-id', [client.Keys.ENTER])
      .waitForElementPresent('.panel-button.upload', waitTime, false)
    .end();
  }
};
