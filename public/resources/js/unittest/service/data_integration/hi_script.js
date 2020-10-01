modul.data_integration["ประวัติการรันสคริปต์"] = function(){
    var url = 'thaiwater30/backoffice/dataimport_config/history_page'; //see this line
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
        it('should have property date range', function(done){
            result.data['data'].should.have.property('date_range');
            done();
        });
		it('property date range should be number', function(done){
            result.data['data']['date_range'].should.be.a('number');
            done();
        });
        it('should have property select option', function(done){
            result.data['data'].should.have.property('select_option');
            done();
        });       
    });
};
