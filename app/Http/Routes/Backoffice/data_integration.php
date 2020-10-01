<?php
/** Route for Datalink Module **/
Route::get('/data_integration', 'Backoffice\Data_integrationController@index');
Route::get('/data_integration/mgmt_script', 'Backoffice\Data_integrationController@mgmt_script');
Route::get('/data_integration/mgmt_conv', 'Backoffice\Data_integrationController@mgmt_conv');
Route::get('/data_integration/mgmt_metadata', 'Backoffice\Data_integrationController@mgmt_metadata');
Route::get('/data_integration/hi_script', 'Backoffice\Data_integrationController@hi_script');

Route::get('/data_integration/mgmt_script_rain', 'Backoffice\Data_integrationController@mgmt_script_rain');
Route::get('/data_integration/mgmt_conv_rain', 'Backoffice\Data_integrationController@mgmt_conv_rain');
Route::get('/data_integration/mgmt_metadata_rain', 'Backoffice\Data_integrationController@mgmt_metadata_rain');
Route::get('/data_integration/hi_script_rain', 'Backoffice\Data_integrationController@hi_script_rain');


Route::get('/data_integration/compare_image', 'Backoffice\Data_integrationController@compare_image');
Route::get('/data_integration/compare_transection', 'Backoffice\Data_integrationController@compare_transection');
Route::get('/data_integration/compare_master', 'Backoffice\Data_integrationController@compare_master');


Route::get('/data_integration/mgmt_cron', 'Backoffice\Data_integrationController@mgmt_cron');
Route::get('/data_integration/cron_setting', 'Backoffice\Data_integrationController@cron_setting');

Route::get('/data_integration/config_variable','Backoffice\Data_integrationController@config_variable');

