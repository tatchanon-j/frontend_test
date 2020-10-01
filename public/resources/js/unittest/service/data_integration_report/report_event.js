modul.data_integration_report["รายงานเหตุการณ์"] = function(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy+'-'+mm+'-'+dd;
    var url = 'thaiwater30/backoffice/data_integration_report/event_load?';
    url += 'start_date='+today+'&end_date='+today;
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
