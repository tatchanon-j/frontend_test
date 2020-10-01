<?php
/** Route for DatabaseManagement Module **/
Route::get('/dba', 'Backoffice\DBAController@index');
Route::get('/dba/delete_data', 'Backoffice\DBAController@delete_data');
Route::get('/dba/manage_partition', 'Backoffice\DBAController@manage_partition');
