/**
*
*   Weather Object for handler main page
*
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/

var weather = {};

weather.init = function(){
	weather.initWeather();
}

weather.initWeather = function(){
  weather.serviceURL = 'thaiwater30/public/';
	weather.serviceImageURL = IMAGE_URL;
	weather.service = [
    {'link':'weather_img/storm_history','view':'.view_storm_history'},//1.1
    {'link':'weather_img/india_ocean_ucl','view':'.view_india_ocean_ucl'},//1.2
    {'link':'weather_img/pacific_ocean_ucl','view':'.view_pacific_ocean_ucl'},//1.3
    {'link':'weather_img/weather_map_tmd','view':'.view_weather_map_tmd'},//1.4
    {'link':'weather_img/weather_map_hd','view':'.view_weather_map_hd'},//1.5
    {'link':'weather_img/cloud_kochi','view':'.view_cloud_kochi'},//1.6
    {'link':'weather_img/cloud_us_naval_research_lab','view':'.view_cloud_us_naval_research_lab'},//.17
    {'link':'weather_img/cloud_digital_typhoon','view':'.view_cloud_digital_typhoon'},//1.8
    {'link':'weather_img/satellite_image_gistda','view':'.view_satellite_image_gistda'},//1.9
    {'link':'weather_img/rain_image_us_naval_research_lab','view':'.view_rain_image_us_naval_research_lab'},//1.10
		{'link':'weather_img/satellite_image_gsmaps','view':'.view_satellite_image_gsmaps'},//1.11
		//{'link':'','view':'.'},//1.12
    {'link':'weather_img/contour_image','view':'.view_contour_image'},//1.13,1.14,1.15
    {'link':'weather_img/modis_ndvi_usda','view':'.view_modis_ndvi_usda'},//1.16
    {'link':'weather_img/modis_soil_moisture_usda','view':'.view_modis_soil_moisture_usda'},//1.17
    {'link':'weather_img/modis_precipitation_usda','view':'.view_modis_precipitation_usda'},//1.18
    {'link':'weather_img/sst_ocean_weather','view':'.view_sst_ocean_weather'},//1.19
    {'link':'weather_img/wave_height_ocean_weather','view':'.view_wave_height_ocean_weather'},//1.20
    {'link':'weather_img/gssh_aviso','view':'.view_gssh_aviso'},//1.21
    {'link':'weather_img/sst_2w_haii','view':'.view_sst_2w_haii'},//1.22
    {'link':'weather_img/ssh_event_haii','view':'.view_ssh_event_haii'},//1.23
    {'link':'weather_img/ssh_w_haii','view':'.view_ssh_w_haii'},//1.24
  ];

	if(weather.service.length>0){
			for(var i=0;i<weather.service.length ;i++){
					weather.handlerGetWeatherService(weather.service[i].link,weather.service[i].view);
			}
	}
}

/**
 *   rewuest weather service
 *   @param {text} link - service link
 *   @param {text} view - class view area
 */
weather.handlerGetWeatherService = function(link,view){
		apiService.SendRequest('GET', weather.serviceURL+link, null, function (data){
				if (data.result == "OK") {
						var data = data.data;
						if(Array.isArray(data)){
							for(var a=0;a<data.length;a++){
								var child = true;
								if(view =='.view_weather_map_tmd')child=false;
								weather.renderWeatherService(data[a],view,child);
								if(view =='.view_weather_map_tmd')break;
							}
						}else{
								weather.renderWeatherService(data,view);
						}
				}
		});
}

/**
 *   render weather service
 *   @param {object} data - result data of service
 *   @param {text} view - class view area
 *   @param {boolean} child - check child data
 */
weather.renderWeatherService = function (data,view,child=false){
		var html = '';
				if(child)
				html += '<div class="col-md-3 col-sm-6">';
				html += weather.generateCoverImage(data,view);
				html += weather.generateDescription(data);
				html += weather.generateButton(data);
				html += weather.generateAgencyLabel(data);
				if(child)
				html += '</div>';

		$(html).appendTo(view);
		weather.generateNoThumbnail(view);
}

/**
 *   genarate button detail
 *   @param {object} data - result data of service
 */
weather.generateButton = function (data){
		var detail 						= JH.GetJsonValue(data, "detail");
		var detail_link 			= JH.GetJsonValue(detail[0], "link");
		var detail_link_type 	= JH.GetJsonValue(detail[0], "link_type");

		var btn = '';
		for(var i=0;i<detail.length;i++){
			var desc_name_th 	= detail[i].description.th;
			var desc_name 		= JH.GetJsonLangValue(detail[i], "description");
			var link					= weather.isValidUrl(JH.GetJsonValue(detail[i], "link"));
			var link_type			= JH.GetJsonValue(detail[i], "link_type");

			switch (desc_name_th){
				case 'ชมพายุ' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" > <i class="fa fa-play-circle-o"></i> '+desc_name+'</a> ';
					break;
				case 'รูปภาพจากคลัง' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" > <i class="fa fa-database"></i> </a> ';
					break;
				case 'ดูข้อมูลย้อนหลัง' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" > <i class="fa fa-database"></i> </a> ';
					break;
				case 'ภาพเคลื่อนไหว' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" data-lightbox="animation" data-title="'+desc_name+'"> <i class="fa fa-video-camera"></i> </a> ';
					break;
				case 'ประเทศไทย' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" data-lightbox="thailand" data-title="'+desc_name+'">   '+desc_name+'</a><br/>';
					break;
				case 'มหาสมุทรอินเดีย' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" data-lightbox="india" data-title="'+desc_name+'">   '+desc_name+'</a><br/>';
					break;
				case 'มหาสมุทรแปซิฟิกเหนือ' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" data-lightbox="pacific" data-title="'+desc_name+'">   '+desc_name+'</a><br/>';
					break;
				case 'ทั่วโลก' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" ';
					if(weather.isValidImage(link))
					btn += 'data-lightbox="world" data-title="'+desc_name+'"';
					btn += '>'+desc_name+'</a>';
					break;
				case 'ภาพเมฆ' :
					btn += '<a class="btn btn-outline btn-sm" role="button" href="'+link+'" title="'+desc_name+'" target="'+link_type+'" data-lightbox="cloud" data-title="'+desc_name+'">   '+desc_name+'</a>';
					break;
				default:
					break;
			}
		}
		return btn;
}

/**
 *   genarate agency label
 *   @param {object} data - result data of service
 */
weather.generateAgencyLabel = function (data){
		var agency 			= JH.GetJsonValue(data, "agency");
		var agency_name = JH.GetJsonLangValue(agency,'agency_name');
		var label  = '<div class="powered text-right">จัดทำโดย :';
				label += '<a href="'+agency.agency_link+'" target="'+agency.link_type+'">'+agency_name+'</a>';
				label += '</div>';
		return label;
}

/**
 *   genarate cover image
 *   @param {object} data - result data of service
 *   @param {text} view - class view area
 */
weather.generateCoverImage = function (data,view){
		var cover_image 						= JH.GetJsonValue(data, "cover_image");
		var description_name 				= JH.GetJsonLangValue(data, "description.description_name");
		var img  = '';
				if(cover_image.link_type=='modal'){
					img += '<a href="'+weather.serviceImageURL+cover_image.media_path+'" alt="'+description_name+'" data-lightbox="'+view+'.ss" data-title="'+description_name+'" >';
					img += '<img src="'+weather.serviceImageURL+cover_image.thumbnail_media_path+'"  class="img-fluid img-thumbnail mx-auto d-flex justify-content-around">';
					img += '</a>';
				}else{
					img += '<a href="'+cover_image.cover_link+'" alt="'+description_name+'" target="'+cover_image.link_type+'" >';
					img += '<img src="'+weather.serviceImageURL+cover_image.thumbnail_media_path+'"  class="img-fluid img-thumbnail mx-auto d-flex justify-content-around">';
					img += '</a>';
				}
		return img;
}

/**
 *   genarate description
 *   @param {object} data - result data of service
 */
weather.generateDescription = function(data){
		var description 			= JH.GetJsonValue(data, "description");
		var description_name 	= JH.GetJsonLangValue(description, "description_name");

		var desc  = '<h6 class="text-center m-3">';
				if(description.description_link)
				desc += '<a href="'+description.description_link+'" target="_blank">';
				desc += description_name;
				if(description.description_link)
				desc += '</a>';
				desc += '</h6>';
		return desc;
}

/**
 *   check image thumbnail
 *   @param {text} view - class view div
 */
weather.generateNoThumbnail = function (view){
		$( view + " img" ).on("error ", function() {
			$( view + " img" ).attr('src', 'http://place-hold.it/322x230?text=No%20Image&italic=true');
		});
}

/**
 *   url validation
 *   @param {text} url - get url
 */
weather.isValidUrl = function (url) {
	var pattern = /^((http|https|ftp):\/\/)/;
	if(!pattern.test(url)) {
		url = weather.serviceImageURL + url;
	}
	return url;
}

/**
 *   image url validation
 *   @param {text} url - get url
 */
weather.isValidImage = function(url) {
    var parts = url.split('.');
    var ext = parts[parts.length-1];
    var imageTypes = ['jpg','jpeg','tiff','png','gif','bmp'];
    if(imageTypes.indexOf(ext) !== -1) {
        return true;
    }
}
