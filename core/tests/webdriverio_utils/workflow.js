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
 * @fileoverview Utilities for exploration creation, publication ect. when
 * carrrying out end-to-end testing with webdriverio.
 */

var forms = require('./forms.js');
var path = require('path');
var waitFor = require('./waitFor.js');
var action = require('./action.js');
var CreatorDashboardPage = require('./CreatorDashboardPage.js');
var ExplorationEditorPage = require('./ExplorationEditorPage.js');

// Check if the save roles button is clickable.
var canAddRolesToUsers = async function() {
  return await $('.e2e-test-save-role').isEnabled();
};

// Check if exploration is community owned.
var isExplorationCommunityOwned = async function() {
  return await $('.e2e-test-is-community-owned').isExisting();
};


// Check if the warning message is visible when the title is ''.
var checkForAddTitleWarning = async function() {
  return await $('.e2e-test-title-warning').isDisplayed();
};

// Trigger onblur event for title.
var triggerTitleOnBlurEvent = async function() {
  var explorationTitleInput = $('.e2e-test-exploration-title-input');
  await action.click('Exploration Title Input', explorationTitleInput);
  var explorationObjectiveInput = $(
    '.e2e-test-exploration-objective-input');
  await action.click('Exploration Objective Input', explorationObjectiveInput);
};

// Open edit roles.
var openEditRolesForm = async function() {
  var testEditRoles = $('.e2e-test-edit-roles');
  await action.click('Test edit roles', testEditRoles);
  await action.setValue('Test Role Username', $(
    '.e2e-test-role-username'), 'Chuck Norris');
};

// Creates an exploration, opens its editor and skips the tutorial.
var createExploration = async function(welcomeModalIsShown) {
  await createExplorationAndStartTutorial(false);
  var explorationEditorPage = new ExplorationEditorPage.ExplorationEditorPage();
  var explorationEditorMainTab = explorationEditorPage.getMainTab();
  if (welcomeModalIsShown) {
    await explorationEditorMainTab.exitTutorial();
  }
};

// Creates a new exploration and wait for the exploration tutorial to start.
var createExplorationAndStartTutorial = async function(isCollectionEditor) {
  var creatorDashboardPage = new CreatorDashboardPage.CreatorDashboardPage;
  await creatorDashboardPage.get();

  await creatorDashboardPage.clickCreateActivityButton();
  if (isCollectionEditor) {
    var activityCreationModal = $('.e2e-test-creation-modal');
    await waitFor.visibilityOf(
      activityCreationModal,
      'ActivityCreationModal takes too long to be visible.');
    var createExplorationButton = $(
      '.e2e-test-create-exploration');
    await action.click('Create Exploration Button', createExplorationButton);
  }

  await waitFor.pageToFullyLoad();
  var stateNameText = $('.e2e-test-state-name-text');
  await waitFor.visibilityOf(
    stateNameText, 'State name text takes too long to appear.');
};

/**
 * Only Admin users can create collections.
 */
var createCollectionAsAdmin = async function() {
  var creatorDashboardPage = new CreatorDashboardPage.CreatorDashboardPage;
  await creatorDashboardPage.get();
  await creatorDashboardPage.clickCreateActivityButton();
  var activityCreationModal = $('.e2e-test-creation-modal');
  await waitFor.visibilityOf(
    activityCreationModal, 'Activity Creation modal takes too long to appear');
  await creatorDashboardPage.clickCreateCollectionButton();
};

/**
 * Creating exploration for Admin users.
 */
var createExplorationAsAdmin = async function() {
  var creatorDashboardPage = new CreatorDashboardPage.CreatorDashboardPage;
  await creatorDashboardPage.get();
  await creatorDashboardPage.clickCreateActivityButton();
  var activityCreationModal = $('.e2e-test-creation-modal');
  await waitFor.visibilityOf(
    activityCreationModal, 'Activity Creation modal takes too long to appear');
  await creatorDashboardPage.clickCreateExplorationButton();
};

// This will only work if all changes have been saved and there are no
// outstanding warnings; run from the editor.
var publishExploration = async function() {
  await waitFor.elementToBeClickable(
    $('.e2e-test-publish-exploration'));
  await $('.e2e-test-publish-exploration').isDisplayed();
  var testPublishExploration = $('.e2e-test-publish-exploration');
  await action.click('Test Publish Exploration', testPublishExploration);
  var prePublicationButtonElem = $('.e2e-test-confirm-pre-publication');
  await action.click(
    'Pre Publication Button Element', prePublicationButtonElem);

  await waitFor.invisibilityOf(
    prePublicationButtonElem,
    'prePublicationButtonElem taking too long to disappear while publishing');
  var testConfirmPublish = $('.e2e-test-confirm-publish');
  await action.click('Test Confirm Publish', testConfirmPublish);

  var sharePublishModal = $('.e2e-test-share-publish-modal');
  await waitFor.visibilityOf(
    sharePublishModal, 'Share Publish Modal takes too long to appear');
  var closePublishModalButton = $('.e2e-test-share-publish-close');
  await action.click('Close Publish Modal Button', closePublishModalButton);
};

// Creates and publishes a minimal exploration.
var createAndPublishExploration = async function(
    title, category, objective, language, welcomeModalIsShown) {
  await createExploration(welcomeModalIsShown);
  var explorationEditorPage = new ExplorationEditorPage.ExplorationEditorPage();
  var explorationEditorMainTab = explorationEditorPage.getMainTab();
  await explorationEditorMainTab.setContent(
    await forms.toRichText('new exploration'));
  await explorationEditorMainTab.setInteraction('EndExploration');

  var explorationEditorSettingsTab = explorationEditorPage.getSettingsTab();
  await explorationEditorPage.navigateToSettingsTab();
  await explorationEditorSettingsTab.setTitle(title);
  await explorationEditorSettingsTab.setCategory(category);
  await explorationEditorSettingsTab.setObjective(objective);
  if (language) {
    await explorationEditorSettingsTab.setLanguage(language);
  }
  await explorationEditorPage.saveChanges();
  await publishExploration();
};

var createAddExpDetailsAndPublishExp = async function(
    title, category, objective, language, tags, welcomeModalIsShown) {
  await createExploration(welcomeModalIsShown);
  var explorationEditorPage = new ExplorationEditorPage.ExplorationEditorPage();
  var explorationEditorMainTab = explorationEditorPage.getMainTab();
  await explorationEditorMainTab.setContent(
    await forms.toRichText('new exploration'));
  await explorationEditorMainTab.setInteraction('EndExploration');
  await explorationEditorPage.saveChanges('Save the changes');
  await explorationEditorPage.publishCardExploration(
    title, objective, category, language, tags);
};

// Creates and publishes a exploration with two cards.
var createAndPublishTwoCardExploration = async function(
    title, category, objective, language, welcomeModalIsShown,
    correctnessFeedbackIsEnabled) {
  await createExploration(welcomeModalIsShown);
  var explorationEditorPage = new ExplorationEditorPage.ExplorationEditorPage();
  var explorationEditorMainTab = explorationEditorPage.getMainTab();
  await explorationEditorMainTab.setContent(await forms.toRichText('card 1'));
  await explorationEditorMainTab.setInteraction('Continue');
  var responseEditor = await explorationEditorMainTab.getResponseEditor(
    'default');
  await responseEditor.setDestination('second card', true, null);
  await explorationEditorMainTab.moveToState('second card');
  await explorationEditorMainTab.setContent(
    await forms.toRichText('card 2'), true);
  await explorationEditorMainTab.setInteraction('EndExploration');

  var explorationEditorSettingsTab = explorationEditorPage.getSettingsTab();
  await explorationEditorPage.navigateToSettingsTab();
  await explorationEditorSettingsTab.setTitle(title);
  await explorationEditorSettingsTab.setCategory(category);
  await explorationEditorSettingsTab.setObjective(objective);
  if (language) {
    await explorationEditorSettingsTab.setLanguage(language);
  }
  if (!correctnessFeedbackIsEnabled) {
    await explorationEditorSettingsTab.disableCorrectnessFeedback();
  }
  await explorationEditorPage.saveChanges();
  await publishExploration();
};

// ---- Role management (state editor settings tab) ----

// Here, 'roleName' is the user-visible form of the role name (e.g. 'Manager').
var _addExplorationRole = async function(roleName, username) {
  await action.click(
    'Edit roles', $('.e2e-test-edit-roles'));
  await action.setValue(
    'Username input',
    $('.e2e-test-role-username'),
    username);
  await action.select(
    'Role select', $('.e2e-test-role-select'), roleName);
  await action.click(
    'Save role', $('.e2e-test-save-role'));
};

var addExplorationManager = async function(username) {
  await _addExplorationRole('Manager', username);
};

var addExplorationCollaborator = async function(username) {
  await _addExplorationRole('Collaborator', username);
};

var addExplorationVoiceArtist = async function(username) {
  await action.click('Edit voice artist role button', $(
    '.e2e-test-edit-voice-artist-roles'));
  await action.setValue(
    'New voice artist username input',
    $('.e2e-test-new-voice-artist-username'), username);
  await action.click('Add voice artist button', $(
    '.e2e-test-add-voice-artist-role-button'));
  await waitFor.visibilityOf($(
    '.e2e-test-voice-artist-' + username));
};

var addExplorationPlaytester = async function(username) {
  await _addExplorationRole('Playtester', username);
};

var createSkillAndAssignTopic = async function(
    skillDescription, material, topicName) {
  var topicsAndSkillsDashboardPage = (
    new TopicsAndSkillsDashboardPage.TopicsAndSkillsDashboardPage());
  await topicsAndSkillsDashboardPage.get();
  await topicsAndSkillsDashboardPage.createSkillWithDescriptionAndExplanation(
    skillDescription, material, true);
  await topicsAndSkillsDashboardPage.get();
  await topicsAndSkillsDashboardPage.navigateToSkillsTab();
  await topicsAndSkillsDashboardPage.filterSkillsByStatus('Unassigned');
  await topicsAndSkillsDashboardPage.searchSkillByName(skillDescription);
  await topicsAndSkillsDashboardPage.assignSkillToTopic(
    skillDescription, topicName);
};

var getImageSource = async function(customImageElement) {
  await waitFor.visibilityOf(
    customImageElement,
    'Image element is taking too long to appear.');
  return await customImageElement.getAttribute('src');
};

var uploadImage = async function(
    imageClickableElement, imgPath, resetExistingImage) {
  await action.click('Image clickable element', imageClickableElement);
  var thumbnailResetButton = $(
    '.e2e-test-thumbnail-reset-button');
  if (resetExistingImage) {
    expect(await thumbnailResetButton.isExisting()).toBe(true);
    await action.click('Topic thumbnail reset button', thumbnailResetButton);
  } else {
    expect(await thumbnailResetButton.isExisting()).toBe(false);
  }

  absPath = path.resolve(__dirname, imgPath);
  var imageUploadInput = $('.e2e-test-photo-upload-input');
  return await action.setValue(
    'Image Upload Input', imageUploadInput, absPath, clickInputElement = false);
};

var submitImage = async function(
    imageClickableElement, imageContainer, imgPath, resetExistingImage) {
  await waitFor.visibilityOf(
    imageClickableElement,
    'Image element is taking too long to appear.');
  await uploadImage(imageClickableElement, imgPath, resetExistingImage);
  await waitFor.visibilityOf(
    imageContainer, 'Image container is taking too long to appear');
  var imageSubmitButton = $('.e2e-test-photo-upload-submit');
  await action.click('Image submit button', imageSubmitButton);
  var imageUploadInput = $('.e2e-test-photo-upload-input');
  await waitFor.invisibilityOf(
    imageUploadInput,
    'Image uploader is taking too long to disappear');
  await waitFor.invisibilityOf(
    imageContainer,
    'Image container is taking too long to disappear');
  return await waitFor.pageToFullyLoad();
};

var createQuestion = async function() {
  var skillEditorPage = new SkillEditorPage.SkillEditorPage();
  var explorationEditorPage = new ExplorationEditorPage.ExplorationEditorPage();
  var explorationEditorMainTab = explorationEditorPage.getMainTab();
  await skillEditorPage.moveToQuestionsTab();
  await skillEditorPage.clickCreateQuestionButton();
  await explorationEditorMainTab.setContent(
    await forms.toRichText('Question 1'));
  await explorationEditorMainTab.setInteraction(
    'TextInput', 'Placeholder', 5);
  await explorationEditorMainTab.addResponse(
    'TextInput', await forms.toRichText('Correct Answer'), null, false,
    'FuzzyEquals', ['correct']);
  var responseEditor = await explorationEditorMainTab.getResponseEditor(0);
  await responseEditor.markAsCorrect();
  await (
    await explorationEditorMainTab.getResponseEditor('default')
  ).setFeedback(await forms.toRichText('Try again'));
  await explorationEditorMainTab.addHint('Hint 1');
  await explorationEditorMainTab.addSolution('TextInput', {
    correctAnswer: 'correct',
    explanation: 'It is correct'
  });
  await skillEditorPage.saveQuestion();
};

exports.getImageSource = getImageSource;
exports.submitImage = submitImage;
exports.uploadImage = uploadImage;

exports.createExploration = createExploration;
exports.createExplorationAndStartTutorial = createExplorationAndStartTutorial;
exports.publishExploration = publishExploration;
exports.createAndPublishExploration = createAndPublishExploration;
exports.createCollectionAsAdmin = createCollectionAsAdmin;
exports.createExplorationAsAdmin = createExplorationAsAdmin;
exports.createAndPublishTwoCardExploration = createAndPublishTwoCardExploration;

exports.canAddRolesToUsers = canAddRolesToUsers;
exports.isExplorationCommunityOwned = isExplorationCommunityOwned;
exports.checkForAddTitleWarning = checkForAddTitleWarning;
exports.triggerTitleOnBlurEvent = triggerTitleOnBlurEvent;
exports.openEditRolesForm = openEditRolesForm;
exports.addExplorationManager = addExplorationManager;
exports.addExplorationCollaborator = addExplorationCollaborator;
exports.addExplorationVoiceArtist = addExplorationVoiceArtist;
exports.addExplorationPlaytester = addExplorationPlaytester;
exports.createAddExpDetailsAndPublishExp = createAddExpDetailsAndPublishExp;
exports.createSkillAndAssignTopic = createSkillAndAssignTopic;
exports.createQuestion = createQuestion;
