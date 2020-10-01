modul.data_integration["ตั้งค่าเชื่อมโยง"] = function(){
    var url = 'thaiwater30/backoffice/dataimport_config/metadata'; //see this line
    describe('GET : ' + url, function(){
        var result;
        before(function(done){
            apiService.SendRequest("GET",url,{},function(){ //method,url,param,success fn, error fn
                result = unittest.cb(done, arguments); //data: arg[0], textStatus: arg[1], jqXHR: arg[2]
                
            },function(){
                result = unittest.cb(done, arguments);
            });
        });
        it('should return status code 200', function(done){
            result.jqXHR.status.should.equal(200);
            done();
        });
        it('should have property metadata list', function(done){
            result.data['data'].should.have.property('metadata_list');
            done();
        });
        it('should have property select option', function(done){
            result.data['data'].should.have.property('select_option');
            done();
        });       
    });
};
