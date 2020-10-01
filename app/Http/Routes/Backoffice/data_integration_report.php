<?php
/** Route for Report Module **/
Route::get('/data_integration_report', 'Backoffice\Data_integration_reportController@index');
Route::get('/data_integration_report/report_event', 'Backoffice\Data_integration_reportController@report_event');
Route::get('/data_integration_report/report_import_by_year', 'Backoffice\Data_integration_reportController@report_import_by_year');
Route::get('/data_integration_report/report_import_by_month', 'Backoffice\Data_integration_reportController@report_import_by_month');
Route::get('/data_integration_report/report_import_by_date', 'Backoffice\Data_integration_reportController@report_import_by_date');
Route::get('/data_integration_report/report_import', 'Backoffice\Data_integration_reportController@report_import');
Route::get('/data_integration_report/report_import_print', 'Backoffice\Data_integration_reportController@report_import_print');
Route::get('/data_integration_report/event_report', 'Backoffice\Data_integration_reportController@event_report');
Route::get('/data_integration_report/metadata_report', 'Backoffice\Data_integration_reportController@metadata_report');
Route::get('/data_integration_report/water_department', 'Backoffice\Data_integration_reportController@water_department');
