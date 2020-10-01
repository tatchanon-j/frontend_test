modul.event_management["ผู้รับผิดชอบเหตุการณ์"] = function(){
    var url = 'thaiwater30/backoffice/event_management/sink_target';
    describe('GET : ' + url, function(){
        var result;
        before(function(done){
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
