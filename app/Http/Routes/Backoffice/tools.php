<?php
/** Route for Displaydata Module **/
Route::get('/tools', 'Backoffice\ToolsController@index');
Route::get('/tools/mgmt_cache', 'Backoffice\ToolsController@mgmt_cache');
Route::get('/tools/mgmt_display', 'Backoffice\ToolsController@mgmt_display');
Route::get('/tools/ignore_data', 'Backoffice\ToolsController@ignore_data');
Route::get('/tools/check_image', 'Backoffice\ToolsController@check_image');
Route::get('/tools/compare_image', 'Backoffice\ToolsController@compare_image');
Route::get('/tools/compare_transection', 'Backoffice\ToolsController@compare_transection');
Route::get('/tools/compare_master', 'Backoffice\ToolsController@compare_master');
Route::get('/tools/display_setting', 'Backoffice\ToolsController@display_setting');
Route::get('/tools/manage_one','Backoffice\ToolsController@manage_one');
Route::get('/tools/manage_two','Backoffice\ToolsController@manage_two');
Route::get('/tools/blacklist','Backoffice\ToolsController@blacklist');
