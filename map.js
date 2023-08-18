var map;
var markerArr = new Array();
var distanceArr = new Array();
var pathArr = new Array();
var maxArr = new Array();
var bestArr = new Array();
var drawInfoArr = [];
var resultdrawArr = [];
var markersPosition = [];
var currentMarker;
var appKey = "l7xx699139287629467e9aeb4001b760cb68"; //l7xx699139287629467e9aeb4001b760cb68
var startend = [[37.571064, 126.934049], [37.571555, 126.932956]];
var number = "01024912057";


function findCurrent(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
				function (position) {
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;
				//팝업 생성
				var content = "<div style=' position: relative; border-bottom: 1px solid #dcdcdc; line-height: 18px; padding: 0 35px 2px 0;'>"
					+ "<div style='font-size: 12px; line-height: 15px;'>"							+ "<span style='display: inline-block; width: 14px; height: 14px; background-image: url(CCTV.png); vertical-align: middle; margin-right: 5px;'></span>현재위치"
					+ "</div>" + "</div>"	
				marker = new Tmapv2.Marker({
					position : new Tmapv2.LatLng(lat,lon),
					map : map,
					});
				currentMarker = marker;
				console.log('현재위치: '+ currentMarker.getPosition());
				map.setCenter(new Tmapv2.LatLng(lat,lon));
				//map.setZoom(15);
				return marker;
			});		
	}
}


function arrival(){
	findCurrent()
    var distance = currentMarker.getPosition().distanceTo(markerArr[1].getPosition());
    if (distance < 30){//도착 위치에 있을 경우(30m 안쪽에 있을경우)
        console.log(distance);
        return true;
    }
    else{
        return false;
    }

}

function startMap(){
	newMap(startend);
	findCurrent();
}

function findWay() {
	emptyArr();
	findPosition()
	load(replexArr(startend));	
}

function newMap(position) {
	map = new Tmapv2.Map("map_div", {
		center : new Tmapv2.LatLng(37.566463, 126.930376),
		width : "100%",
		height : "100%",
		zoom : 17,
		zoomControl : true,
		scrollwheel : true
	});
	
	return map;
}

function findPosition() {
	// 2. API 사용요청
	var find = [$("#depart").val(), $("#arrive").val()];
	var pos = [];
	for (var i = 0; i<find.length;i++){
	$.ajax({
		method : "GET",
		url : "https://apis.openapi.sk.com/tmap/geo/fullAddrGeo?version=1&format=json&callback=result",
		async : false,
		data : {
			"appKey" : appKey,
			"coordType" : "WGS84GEO",
			"fullAddr" : find[i]
		},
		success : function(response) {
			var resultInfo = response.coordinateInfo; // .coordinate[0];
			console.log(resultInfo);
			// 검색 결과 정보가 없을 때 처리
			if (resultInfo.coordinate.length == 0) {
				alert("요청 데이터가 올바르지 않습니다.");
				
			} else {
				var lonEntr, latEntr;
				var resultCoordinate = resultInfo.coordinate[0];
				if (resultCoordinate.lonEntr == undefined && resultCoordinate.newLonEntr == undefined) {
					lonEntr = 0;
					latEntr = 0;
				} else {
					if (resultCoordinate.lonEntr.length > 0) {
						lonEntr = resultCoordinate.lonEntr;
						latEntr = resultCoordinate.latEntr;
					} else {
						lonEntr = resultCoordinate.newLonEntr;
						latEntr = resultCoordinate.newLatEntr;
					}
				}
				console.log([latEntr, lonEntr]);
				pos.push([latEntr, lonEntr]);
				}				
			},
			error : function(request, status, error) {
				console.log(request);
				console.log("code:"+request.status + "\n message:" + request.responseText +"\n error:" + error);
				// 에러가 발생하면 맵을 초기화함
				// markerStartLayer.clearMarkers();
				// 마커초기화
				map.setCenter(new Tmapv2.LatLng(37.570028, 126.986072));
			}
		});
	}
	pos[0][0] = Number(pos[0][0])
	pos[0][1] = Number(pos[0][1])
	pos[1][0] = Number(pos[1][0])
	pos[1][1] = Number(pos[1][1])
	startend = replexArr(pos);
}

function load(position){
	removeMarkers();

    var xhr = new XMLHttpRequest();
    var url = `http://openapi.seoul.go.kr:8088/4d74574c717a696138385a74757765/xml/safeOpenCCTV_sm/1/1000/`; /* URL */
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
    if (this.readyState == xhr.DONE) {  // <== 정상적으로 준비되었을때
        if(xhr.status == 200||xhr.status == 201){ // <== 호출 상태가 정상적일때
			console.log("start finding CCTV");
            
			var latlng = getData(xhr);
			var start = [position[0][0], position[0][1]];
			var end = [position[1][0], position[1][1]];            
			var incircle = getCctvInCircle(start, end, latlng);
			markersPosition = replexArr(incircle);

			console.log(markersPosition);
			console.log("end finding CCTV");

			draw(position);
			return;
        }}};
	xhr.send('');
};

function loadAll(position){
	removeMarkers();
	removePath();
    var xhr = new XMLHttpRequest();
    var url = `http://openapi.seoul.go.kr:8088/4d74574c717a696138385a74757765/xml/safeOpenCCTV_sm/1/1000/`; /* URL */
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
    if (this.readyState == xhr.DONE) {  // <== 정상적으로 준비되었을때
        if(xhr.status == 200||xhr.status == 201){ // <== 호출 상태가 정상적일때
			console.log("start finding CCTV");
            var latlng = getData(xhr);
            //marker 좌표 불러오기
            for(var i = 0; i<latlng.length;i++){
				addCCTVMarker(latlng[i][0],latlng[i][1])
            };
			return;
        }}};
xhr.send('');
};

function findDistance(stX, stY, enX, enY){
	var distance;
    $
		.ajax({
			method : "POST",
			url : "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
			async : false,
			data : {
				"appKey" : appKey,
				"startX" : stX,
				"startY" : stY,
				"endX" : enX,
				"endY" : enY,
				"reqCoordType" : "WGS84GEO",
				"resCoordType" : "EPSG3857",
				"startName" : "출발지",
				"endName" : "도착지"
				},
			success : function(response) {
				var resultData = response.features;
				distance = (resultData[0].properties.totalDistance) / 1000;
                }, error : function(request, status, error) {
					console.log("code:" + request.status + "\n"
							+ "message:" + request.responseText + "\n"
							+ "error:" + error);
				}
        })
		sleep(500);
		return distance;
}

function findMax(){
	for(var num = 2; num<markerArr.length-1; num++){
		for(i = 0; i<markerArr.length-2; i++){
			var min_dis = 999999;
			var min_position;
			var min_num;

			for(j = 2; j<markerArr.length; j++){
				var pre_dis = pathArr[i][0];
				var bol = true;
				for(var n = 1; n<pathArr[0].length; n++){
					if(j == pathArr[i][n]){
						bol = false;
					}
				}

				if(bol){
					for(k = 1; k<pathArr[0].length - 1; k++){
						var mid_dis = pre_dis + distanceArr[pathArr[i][k]][j] + distanceArr[j][pathArr[i][k+1]] - distanceArr[pathArr[i][k]][pathArr[i][k+1]]
						if(min_dis > mid_dis){
							min_dis = mid_dis;
							min_position = k;
							min_num = j;
						}
					}
				}
			}
			pathArr[i].splice(min_position+1, 0, min_num);
			pathArr[i][0] = min_dis;

			if((num/min_dis) > maxArr[i][0]){
				maxArr[i] = replexArr(pathArr[i]);
				maxArr[i][0] = num/min_dis;
			}
		}
		
	}
	var bestPath = [0];
	for(i = 0; i<markerArr.length-2; i++){
		if(bestPath[0] < maxArr[i][0]){
			bestPath= replexArr(maxArr[i]);
		}
	}
	return bestPath;
}

function findPath(stX, stY, enX, enY){
	var information = [];
	$
	.ajax({
		method : "POST",
		url : "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
		async : false,
		data : {
			"appKey" : appKey,
			"startX" : stX,
			"startY" : stY,
			"endX" : enX,
			"endY" : enY,
			" " : "WGS84GEO",
			"resCoordType" : "EPSG3857",
			"startName" : "출발지",
			"endName" : "도착지"
		},
		success : function(response) {
			var resultData = response.features;

			information.push((resultData[0].properties.totalDistance) / 1000);
			information.push((resultData[0].properties.totalTime) / 60);
			
			
			//기존 그려진 라인 & 마커가 있다면 초기화
			if (resultdrawArr.length > 0) {
				for ( var i in resultdrawArr) {
					resultdrawArr[i]
							.setMap(null);
				}
				resultdrawArr = [];
			}
		
			for ( var i in resultData) { //for문 [S]
				var geometry = resultData[i].geometry;
				var properties = resultData[i].properties;
				var polyline_;


				if (geometry.type == "LineString") {
					for ( var j in geometry.coordinates) {
						// 경로들의 결과값(구간)들을 포인트 객체로 변환 
						var latlng = new Tmapv2.Point(
								geometry.coordinates[j][0],
								geometry.coordinates[j][1]);
						// 포인트 객체를 받아 좌표값으로 변환
						var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
								latlng);
						// 포인트객체의 정보로 좌표값 변환 객체로 저장
						var convertChange = new Tmapv2.LatLng(
								convertPoint._lat,
								convertPoint._lng);
						// 배열에 담기
						drawInfoArr.push(convertChange);
					}
				} 
			}
		},
		error : function(request, status, error) {
			console.log("code:" + request.status + "\n"
					+ "message:" + request.responseText + "\n"
					+ "error:" + error);
		}
	});
	sleep(500);
	return information;
}


function draw(position){
	console.log("start finding Distance");
	marker_m1 = addMarker(position[0][0], position[0][1]);//홍입
	marker_m2 = addMarker(position[1][0], position[1][1]);//신촌역
	
	for(var i = 0; i<markersPosition.length; i++){
		addCCTVMarker(markersPosition[i][0], markersPosition[i][1])
	}
	
	for(var i = 0; i<markerArr.length; i++){
		var distance = [];
		for(var j = 0; j<markerArr.length; j++){
			if(i == j) {distance.push(0);}
			else if(i > j) {distance.push(distanceArr[j][i]);}
			else if(i <j) {
				distance.push(findDistance(getX(markerArr[i]), getY(markerArr[i]), getX(markerArr[j]), getY(markerArr[j])))
			};
		}
		distanceArr.push(distance);
	}
	console.log(distanceArr);
	if(markerArr.length > 2){
		for(var i = 2; i<markerArr.length; i++){
			var p = distanceArr[0][i] + distanceArr[1][i]
			var m = 1/(distanceArr[0][i] + distanceArr[1][i]);
			var path = [p, 0, i, 1];
			var max = [m, 0, i, 1]
			
			maxArr.push(max);
			pathArr.push(path);
		}
		
		bestArr = findMax();
	}

	else{
		p = [distanceArr[0][1], 0, 1];
		m = [1/distanceArr[0][1], 0, 1];

		maxArr = m;
		pathArr = p;
		bestArr= replexArr(maxArr);
	}

	

	console.log("end finding Distance");

	console.log("start drawing Path");

	var totalDistance = 0;
	var totalTime = 0; 
	for(var i = 1; i < bestArr.length-1; i++){
		var information = findPath(getX(markerArr[bestArr[i]]), getY(markerArr[bestArr[i]]), getX(markerArr[bestArr[i+1]]), getY(markerArr[bestArr[i+1]]));
		totalDistance += information[0];
		totalTime += information[1];
	}
	
	map.setCenter(new Tmapv2.LatLng(position[0][0], position[0][1]));
	map.setZoom(17);
	document.getElementById("result").innerText = "이동거리: " + totalDistance.toFixed(1) +	"km";	
	document.getElementById("result").innerHTML += "<button id=\"close\" onclick = Close()>X</button>"
	document.getElementById("result").innerHTML += "<p>예상시간: " + totalTime.toFixed(0) + "분<p>";
	document.getElementById("result").innerHTML += "<button id=\"start\" onclick = Start(" + totalTime + ")>출발하기</button>"
	document.getElementById("result").style.padding = "10px";
	document.getElementById("result").style.border = "1px solid black";
	drawLine(drawInfoArr);
	console.log("end drawing Path");
}

function Close(){
	document.getElementById("result").innerHTML = "";
	document.getElementById("result").style.padding = "0px";
	document.getElementById("result").style.border = "0px solid black";
}

function Start(timetakes){
	console.log(timetakes);

	console.log(arrival())
	var ms = timetakes*60*1000;
	setTimeout(function(){
		var t = 0;
		while(t<ms){
			if (arrival()){
				console.log("도착")
				//  const form = document.createElement('form');
				//    form.method = 'post';
				//   form.action = '/asd';
				//    document.body.appendChild(form);
	
				//  const formField = document.createElement('input');
				//  formField.name = 'tel';
				//  formField.value = numb;
		
				//  form.appendChild(formField);
				//  form.submit();
				return;
			}
			t += 2000;
			console.log("false");
			sleep(2000);
		}
		
		//문자 보내기
	},0)
 }

function drawLine(arrPoint) {
	var polyline_;

	polyline_ = new Tmapv2.Polyline({
		path : arrPoint,
		strokeColor : "paleturquoise",
		strokeWeight : 4,
		map : map
	});
	resultdrawArr.push(polyline_);
}

function replexArr(arr){
	var replex = [];
	for(var i = 0; i<arr.length; i++) { replex.push(arr[i]); }
	return replex
}

function sleep(ms) {
	const wakeUpTime = Date.now() + ms;
	while (Date.now() < wakeUpTime) {}
}

function getX(marker){
	return marker.getPosition()._lng.toString();
}

function getY(marker){
	return marker.getPosition()._lat.toString();
}

function addMarker(X,Y){
	var marker = new Tmapv2.Marker({
		position : new Tmapv2.LatLng(X, Y),
		icon : "Position.png",
		iconSize : new Tmapv2.Size(30, 25),
		map : map
	});
	marker.setMap(map);
	markerArr.push(marker);
	return marker;
}

function addCCTVMarker(X,Y){
	var marker = new Tmapv2.Marker({
		position : new Tmapv2.LatLng(X, Y),
		icon : "CCTV.png",
		iconSize : new Tmapv2.Size(20.5, 25),
		map : map
	});
	marker.setMap(map);
	markerArr.push(marker);
	console.log(marker.getPosition());
	return marker;
}

function getData(xhr){
    var xmlDoc = xhr.responseXML;
    var latlng = [];
    for (var i=0; i<1000; i++){
        var lat = xmlDoc.getElementsByTagName('row')[i].getElementsByTagName('WGSXPT')[0].firstChild.data;
        var lng = xmlDoc.getElementsByTagName('row')[i].getElementsByTagName('WGSYPT')[0].firstChild.data;
        latlng.push([lat,lng]);
    }
    return latlng
}
	
    
// 모든 마커를 제거하는 함수입니다.
function removeMarkers() {
	for (var i = 0; i < markerArr.length; i++) {
		markerArr[i].setMap(null);
	}
	markerArr = [];

	
}

function removePath(){
	if (resultdrawArr.length > 0) {
		for ( var i in resultdrawArr) {
			resultdrawArr[i]
					.setMap(null);
		}
		resultdrawArr = [];
	}
}

function getCctvInCircle(start, end, latlng){
    var incircle = [];
    for(var i = 0; i < latlng.length; i++){
        if(makeCircle(start, end, latlng[i]) == true){
            incircle.push(latlng[i]);
        } ;}
    return incircle;
}

function makeCircle(start, end, cctvlatlng){
    //input start: 출발지의 latlng (array)
    //input end: 도착지의 latlng(array)
    //input cctvlatlng: 비교하기 위한 cctv latlng(array)  
    //출발지 도착지의 원 반경안에 있는 cctv인지 검사하는 함수 
    //원 반경 안에 있는 경우 return true
    var center = [(start[0]+end[0])/2, (start[1]+end[1])/2];
    var dis_x = start[0]-end[0];
    var dis_y = start[1]-end[1];
    var dis_ctocc_x = cctvlatlng[0]-center[0];
    var dis_ctocc_y = cctvlatlng[1]-center[1];
    var radius = Math.sqrt(Math.abs(dis_x*dis_x)+Math.abs(dis_y*dis_y))/2; 
    var distance = Math.sqrt(Math.abs(dis_ctocc_x*dis_ctocc_x)+Math.abs(dis_ctocc_y*dis_ctocc_y));
    
    if(radius>=distance){
        return true;
    }
    else{
        return false;
    }
}

function emptyArr(){
	distanceArr = [];
	pathArr = [];
	maxArr = [];
	bestArr = [];
	drawInfoArr = [];
	resultdrawArr = [];
	markersPosition = [];
}
