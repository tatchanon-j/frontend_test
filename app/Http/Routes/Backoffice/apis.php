<?php
/** Route for Manipulate Module **/
Route::get('/apis', 'Backoffice\ApisController@index');
Route::get('/apis/key_access_mgmt', 'Backoffice\ApisController@key_access_mgmt');
Route::get('/apis/monitor', 'Backoffice\ApisController@monitor');
Route::get('/apis/monitor_api_service', 'Backoffice\ApisController@monitor_api_service');
Route::get('/apis/apitest','Backoffice\ApisController@apitest');
Route::get('/apis/monitor_server', 'Backoffice\ApisController@monitor_server');
Route::get('/apis/email_test', 'Backoffice\ApisController@email_test');