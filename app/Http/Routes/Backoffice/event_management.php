<?php
/** Route for Event Module **/
Route::get('/event_management', 'Backoffice\Event_managementController@index');
Route::get('/event_management/event_type', 'Backoffice\Event_managementController@event_type');
Route::get('/event_management/event_subtype', 'Backoffice\Event_managementController@event_subtype');
Route::get('/event_management/event_method','Backoffice\Event_managementController@event_method');
Route::get('/event_management/event_target','Backoffice\Event_managementController@event_target');
Route::get('/event_management/event_mail','Backoffice\Event_managementController@event_mail');
Route::get('/event_management/sink_condition','Backoffice\Event_managementController@sink_condition');
Route::get('/event_management/event_log_sink_method_type','Backoffice\Event_managementController@event_log_sink_method_type');
Route::get('/event_management/event_mgmt_email_sever','Backoffice\Event_managementController@event_mgmt_email_sever');
