// Copyright 2015 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for TeacherDashboardBackendApiService.
 */

import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { TeacherDashboardBackendApiService } from
  './teacher-dashboard-backend-api.service';

describe('Teacher Dashboard Backend API Service', () => {
  var teacherDashboardBackendApiService: TeacherDashboardBackendApiService;
  let httpTestingController: HttpTestingController;

  var sampleShortLearnerGroupData = {
    id: 'groupId',
    title: 'title',
    description: 'description',
    facilitator_usernames: ['facilitator1'],
    students_count: 5
  };

  const TEACHER_DASHBOARD_URL = '/teacher_dashboard_handler';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherDashboardBackendApiService]
    });
    teacherDashboardBackendApiService = TestBed.inject(
      TeacherDashboardBackendApiService);

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should successfully fetch learner groups data to be shown',
    fakeAsync(() => {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      teacherDashboardBackendApiService
        .fetchTeacherDashboardLearnerGroupsAsync()
        .then(successHandler, failHandler);

      var req = httpTestingController.expectOne(TEACHER_DASHBOARD_URL);
      expect(req.request.method).toEqual('GET');
      req.flush({
        learner_groups_list: [sampleShortLearnerGroupData]
      });

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalled();
      expect(failHandler).not.toHaveBeenCalled();
    })
  );
});
