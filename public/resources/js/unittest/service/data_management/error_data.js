modul.data_management["ดาวน์โหลดข้อมูลผิดพลาด"] = function(){
    var url = 'thaiwater30/backoffice/data_management/event_tracking_option_list_invalid_data';
    describe('GET : ' + url, function(){
        var result;
        before(function(done){
			this.timeout(5000);
            apiService.SendRequest("GET",url,{},function(){
                result = unittest.cb(done, arguments);
            },function(){
                result = unittest.cb(done, arguments);
            });
        });
        it('should return status code 200', function(done){
            result.jqXHR.status.should.equal(200);
            done();
        });
        it('should have property result', function(done){
            result.data.should.have.property('result');
            done();
        });
        it('should have property data', function(done){
            result.data.should.have.property('data');
            done();
        });
    });
}
