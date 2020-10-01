<?php
/** Route for Shopping Module **/
// Route::get('/data_service', 'Backoffice\Data_serviceController@index');
// Route::get('/data_service/data_service_register', 'Backoffice\Data_serviceController@data_service_register');
Route::get('/data_service/data_service_to_agency', 'Backoffice\Data_serviceController@data_service_to_agency');
Route::get('/data_service/data_service_upload_result', 'Backoffice\Data_serviceController@data_service_upload_result');
Route::get('/data_service/data_service_approve', 'Backoffice\Data_serviceController@data_service_approve');
Route::get('/data_service/data_service_management', 'Backoffice\Data_serviceController@data_service_management');
Route::get('/data_service/data_service_summary', 'Backoffice\Data_serviceController@data_service_summary');
Route::get('/data_service/data_service_to_agency_print/{id}', 'Backoffice\Data_serviceController@data_service_to_agency_print');
Route::get('/data_service/data_service_summary_print', 'Backoffice\Data_serviceController@data_service_summary_print');
Route::get('/data_service/data_service_admin', 'Backoffice\Data_serviceController@data_service_admin');

// Route::get('/data_service', 'Backoffice\bof_data_serviceController@index');
// Route::get('/data_service/history', 'Backoffice\bof_data_serviceController@history');
