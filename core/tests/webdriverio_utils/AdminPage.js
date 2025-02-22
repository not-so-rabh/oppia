// Copyright 2022 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Page object for the admin page, for use in WebdriverIO
 * tests.
 */

var action = require('./action.js');
var forms = require('./forms.js');
var general = require('./general.js');
var waitFor = require('./waitFor.js');

var AdminPage = function() {
  var ADMIN_URL_SUFFIX = '/admin';
  var addNewRoleButton = $('.e2e-test-add-new-role-button');
  var adminRolesTab = $('.e2e-test-admin-roles-tab');
  var adminRolesTabContainer = $('.e2e-test-roles-tab-container');
  var configTab = $('.e2e-test-admin-config-tab');
  var editUserRoleButton = $('.e2e-test-role-edit-button');
  var progressSpinner = $('.e2e-test-progress-spinner');
  var roleEditorContainer = $('.e2e-test-roles-editor-card-container');
  var roleSelector = $('.e2e-test-new-role-selector');
  var saveAllConfigs = $('.e2e-test-save-all-configs');
  var statusMessage = $('.e2e-test-status-message');
  var usernameInputFieldForRolesEditing = $(
    '.e2e-test-username-for-role-editor');

  var _switchToRolesTab = async function() {
    await action.click('Admin roles tab button', adminRolesTab);

    await expect(await adminRolesTab.getAttribute('class')).toMatch('active');
    await waitFor.visibilityOf(
      adminRolesTabContainer, 'Roles tab page is not visible.');
  };

  var saveConfigProperty = async function(
      configProperty, propertyName, objectType, editingInstructions) {
    await waitFor.visibilityOf(
      configProperty.$('.e2e-test-config-title'),
      'Config Title taking too long too appear');
    var title = await configProperty.$('.e2e-test-config-title').getText();
    if (title.match(propertyName)) {
      await editingInstructions(
        await forms.getEditor(objectType)(configProperty));
      await action.click('Save All Configs Button', saveAllConfigs);
      await general.acceptAlert();
      // Waiting for success message.
      await waitFor.textToBePresentInElement(
        statusMessage, 'saved successfully',
        'New config could not be saved');
      return true;
    }
  };

  this.get = async function() {
    await browser.url(ADMIN_URL_SUFFIX);
    await waitFor.pageToFullyLoad();
  };

  this._editUserRole = async function(username) {
    await this.get();
    await _switchToRolesTab();
    await action.setValue(
      'Username input field', usernameInputFieldForRolesEditing, username);
    await action.click('Edit user role button', editUserRoleButton);
    await waitFor.visibilityOf(
      roleEditorContainer, 'Role editor card takes too long to appear.');
  };

  this.addRole = async function(name, newRole) {
    await this._editUserRole(name);

    await action.click('Add new role', addNewRoleButton);
    await action.matSelect('New role selector', roleSelector, newRole);

    await waitFor.invisibilityOf(
      progressSpinner, 'Progress spinner is taking too long to disappear.');
    var removeButtonElement = $(
      '.e2e-test-' + newRole.split(' ').join('-') +
      '-remove-button-container');
    await waitFor.visibilityOf(
      removeButtonElement, 'Role removal button takes too long to appear.');
  };

  this.editConfigProperty = async function(
      propertyName, objectType, editingInstructions) {
    await this.get();
    await action.click('Config Tab', configTab);
    await waitFor.elementToBeClickable(saveAllConfigs);

    var results = [];
    var configProperties = await $$('.e2e-test-config-property');
    for (let configProperty of configProperties) {
      results.push(
        await saveConfigProperty(
          configProperty, propertyName, objectType, editingInstructions)
      );
    }
    var success = null;
    for (var i = 0; i < results.length; i++) {
      success = success || results[i];
    }
    if (!success) {
      throw new Error('Could not find config property: ' + propertyName);
    }
  };
};

exports.AdminPage = AdminPage;
