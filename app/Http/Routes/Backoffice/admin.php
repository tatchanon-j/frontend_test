<?php
  /** Route for Admin **/
  Route::get('/admin', 'Backoffice\AdminController@index');
  Route::get('/admin/group', 'Backoffice\AdminController@group');
  Route::get('/admin/user/{uid?}', 'Backoffice\AdminController@user');
  Route::get('/admin/user_history', 'Backoffice\AdminController@user_history');
  Route::get('/admin/management_system', 'Backoffice\AdminController@management_system');
  Route::get('/admin/user_setting', 'Backoffice\AdminController@user_setting');
  Route::get('/admin/reset_password', 'Backoffice\AdminController@reset_password');

  Route::get('/admin/apitest','Backoffice\AdminController@apitest');
  Route::get('/admin/unittest','Backoffice\AdminController@unittest');
