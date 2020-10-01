<?php
/** Route for Monitor Module **/
Route::get('/data_management', 'Backoffice\Data_managementController@index');
Route::get('/data_management/monitor_data', 'Backoffice\Data_managementController@monitor_data');
Route::get('/data_management/record_data', 'Backoffice\Data_managementController@record_data');
Route::get('/data_management/error_data', 'Backoffice\Data_managementController@error_data');
Route::get('/data_management/record_error_data', 'Backoffice\Data_managementController@record_error_data');
Route::get('/data_management/mon_error_dgmt', 'Backoffice\Data_managementController@mon_error_dgmt');
Route::get('/data_management/import_data', 'Backoffice\Data_managementController@import_data');
Route::get('/data_management/check_metadata', 'Backoffice\Data_managementController@check_metadata');
Route::get('/data_management/check_data_error', 'Backoffice\Data_managementController@check_data_error');
Route::get('/data_management/check_latest_data', 'Backoffice\Data_managementController@check_latest_data');
