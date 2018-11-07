myApp.controller('menuCtrl', function($scope, $timeout, httpClient, headerItemsJson, menuItemsJson, $window, $location, mapConstants, $sce) {
    var vm = this;
    vm.showList = true;
    vm.scope = $scope;
    if($scope.$parent.vm){
         $scope.$parent.vm.showList = true;
    }
    vm.headerItems = headerItemsJson;
    vm.user = JSON.parse($.cookie('user'));
    vm.menuItems = menuItemsJson;
    vm.deviceKey = '';
    vm.realTimeSrc = $sce.trustAsResourceUrl('/smartkitchens/view/html/views/dashboard/container_dashboard.html?deviceKey='+vm.deviceKey+"&auth_token="+$.cookie('token'));

    vm.selectedItem = function(selected){
        if(selected && selected.originalObject.key){
            vm.selectedObject = selected.originalObject;
        }else if(selected){
            vm.selectedObject = {
                "key" : selected.originalObject.assetKey,
                "name" : selected.originalObject.display,
                "id" : selected.originalObject.assetId,
                "building": selected.originalObject.details.building.value,
                "type": selected.originalObject.details.type.value,
                "timestamp": selected.originalObject.details.timestamp
            };
        }
        if(selected){
            var key = selected.originalObject.key || selected.originalObject.assetKey;
            vm.deviceKey = key;
            vm.realTimeSrc = $sce.trustAsResourceUrl('/smartkitchens/view/html/views/dashboard/container_dashboard.html?deviceKey='+vm.selectedObject.id+"&auth_token="+$.cookie('token'));
            $scope.$broadcast('mapFoucsOnMarker', key);
            vm.updateAllData(selected.originalObject.id);
        }
    }

    vm.defaultCellRenderer = function(params){
        return '<span class="ag-cell-inner" tooltip-placement="auto" uib-tooltip="'+ params.value +'">'+params.value+'</span>'
    }

    vm.startDateOnSetTime = function(date){
        vm.startDate = date.toString();
        if(vm.startDate != null && vm.endtDate != null){
            var params = {
                id: vm.vehicleId,
                timeframe: "{\"start\": \""+vm.startDate+"\",\"end\":  \""+vm.endDate+"\"}"
            }
            vm.getBatteryData(params);
        }
    }
    vm.endDateOnSetTime = function(date){
        vm.endDate = date.toString();
        if(vm.startDate != null && vm.endDate != null){
            var params = {
                id: vm.vehicleId,
                timeframe: "{\"start\": \""+vm.startDate+"\",\"end\":  \""+vm.endDate+"\"}"
            }
            vm.getBatteryData(params);
        }
    }

    vm.sources = mapConstants.sources;
    vm.icons = mapConstants.infoWindows.icons;

    vm.logsColDef = [
        
        {headerName: "Fridge Temp.", field: "fridge", cellRenderer: function(params){return params.value.temperature.value + " °C"}},
        {headerName: "Fridge Humidity", field: "fridge", cellRenderer: function(params){return params.value.humidity.value +" %"}},
        {headerName: "Fridge Door", field: "fridge", cellRenderer: function (params) {  
            return vm.fridgeStateCellRenderer(params);
        }, cellStyle:function (params) {  
            if(params.value.state.value == "OPENED"){
            	return {'background-color': '#ff8c00', 'text-align': 'center'}
            }else{
                return {'background-color': '#81c784', 'text-align': 'center'}
            }
        }},
        {headerName: "Oven Temp.", field: "oven", cellRenderer: function(params){return params.value.temperature.value + " °C"}},
        {headerName: "Oven Humidity", field: "oven", cellRenderer: function(params){return params.value.humidity.value +" %"}},
          
       {headerName: "Oven Door", field: "oven", cellRenderer: function (params) {  
            return vm.ovenStateCellRenderer(params);
        },  cellStyle: function (params) {  
            if(params.value.state.value == "OPENED"){
            	return {'background-color': '#ff8c00', 'text-align': 'center'}
            }else{
                return {'background-color': '#81c784', 'text-align': 'center'}
            }
        }},
        
        {headerName: "Timestamp", field: "timestamp"}
        
    ] 

    vm.fridgeStateCellRenderer = function(param){
        if(param.value.state.value == "OPENED"){
            return vm.icons.fridge_opened
        }else{
            return vm.icons.fridge_closed
        }
    }
    
     vm.ovenStateCellRenderer = function(param){
        if(param.value.state.value == "OPENED"){
            return vm.icons.oven_opened
        }else{
            return vm.icons.oven_closed
        }
    }

    vm.byCellRenderer = function(param){
        return '<span>' + param.value.value+ '</span>'
    } 

    vm.tamperedCellRenderer = function(param){
        if(param.value.value == true){
            return vm.icons.idTAMPERED
        }else{
            return vm.icons.idUNTAMPERED
        }
    }  

    vm.logsFormatData = function(data){
        if(data && vm.selectedObject && vm.selectedObject.id){
            var lock = data[vm.selectedObject.id]["0"];;
            return {documents: lock, count: lock.length}  
        }
    }

    vm.setMarkerIcon = function(data, marker){
        marker.icon =  mapConstants.sources[marker.source]["kitchen"]
        return marker
    }
    
    vm.onSelectAsset = function(data){
        if(data){
            var name = data.details.building.value + " " + data.details.city.value + " - " + data.assetId;
            $scope.$broadcast('angucomplete-alt:changeInput', "mapList", name);
            vm.realTimeSrc = $sce.trustAsResourceUrl('/smartkitchens/view/html/views/dashboard/container_dashboard.html?deviceKey='+data.assetId);
            vm.selectedObject = {
                "key" : data.assetKey,
                "name" : data.display,
                "id" : data.assetId,
                "building": data.details.building.value,
                "type": data.details.type.value,
                "timestamp": data.details.timestamp
            };
            vm.updateAllData(data.assetId);
        }
    }

    vm.updateAllData = function(id){
        vm.vehicleId = id;
       // vm.getBatteryData({id: vm.vehicleId});
        vm.gridParams = {id: vm.vehicleId};
        $scope.$broadcast('updateGridData', {});
    }

    vm.onHeaderItemClick = function(item){
    }

    vm.onMenuItemClick = function(item){
        if(item && item.label == "map" || item && item.label == "Reports" || item && item.label == "Generic Rules" || item && item.label == "Notification Rules"){
            vm.clearData();
        }
    }
    
    vm.clearData = function(){
        $scope.$broadcast('angucomplete-alt:clearInput', "mapList"); 
        vm.selectedObject = {};
        vm.gridParams = {};
        vm.batteryChart = null;
    }

    vm.getBatteryData = function(params){
        httpClient
            .get("smartkitchens/api/getBatteryData", params)
            .then(
            function(data, response) {
                    vm.batteryChart = data;
            },
            function(err) {
                console
                    .log(
                    "reject published promise",
                    err);
            });
    }

    vm.rescheduleMaintenance =  function(id) {
        var params = {"id": id};
        httpClient
            .get("smartkitchens/api/actions/scheduleService", params)
            .then(
            function(data, response) {
            },
            function(err) {
                console
                    .log(
                    "reject published promise",
                    err);
            });
    };


     vm.closeOpen =  function(id, state, type) {
        var params = {"id": id, "state": ((state == "CLOSED") ? "OPENED" : "CLOSED"), "type": type};
        httpClient
            .get("smartkitchens/api/actions/closeOpen", params)
            .then(
            function(data, response) {
            },
            function(err) {
                console
                    .log(
                    "reject published promise",
                    err);
            });
    };
    
    vm.listCallback = function(data){
        vm.tripsData = [
            {
                "key" : "all",
                "name" : "All"
            }
        ];
        var assets = data;
        for (var key in assets) {
            if (assets.hasOwnProperty(key)) {
                console.log(key, assets[key]);
                vm.pushAssets(key, assets[key])
            }
        }
        return vm.tripsData;
    }
    
    vm.pushAssets = function(assetId, trips) {

        var assetSource = trips.source;
        var key = assetSource + "_" + assetId;

        var assetModel = null;
        var assetMake = null;

        //Asset Trips
        var tripsOrder = trips.order;

        // Loop on asset trips
        for (var t = tripsOrder.length - 1; t >= 0; t--) {
            var tripKey = tripsOrder[t];
            if (trips.hasOwnProperty(tripKey)) {
                var trip = trips[tripKey];

                // Loop on trips points
                for (var i = trip.length - 1; i >= 0; i--) {
                    var tripPoint = trip[i];

                    var tripMarker = {};

                    tripMarker.tripKey = tripKey;

                    tripMarker.details = tripPoint;

                    assetMake  = (tripMarker.details && tripMarker.details.building) ? tripMarker.details.building.value : "";
                    assetModel = (tripMarker.details && tripMarker.details.city) ? tripMarker.details.city.value : "";
                    tripMarker.label = vm.buildAssetLabel(assetMake, assetModel, assetId);


                } //End looping on asset's trip's points
            }// End check for Availble tripKey in trips
        }//End looping on asset's trips
        vm.addAssetToSourceList(assetSource, assetId, key, tripMarker);
    };

    vm.addAssetToSourceList = function(assetSource, assetId, assetKey, tripMarker) {

        vm.tripsData.push({
            "key" : assetKey,
            "name" : tripMarker.label,
            "id" : assetId,
            "building": tripMarker.details.building.value,
            "type": tripMarker.details.type.value,
            "timestamp": tripMarker.details.timestamp
        });

    };

    vm.buildAssetLabel = function(make, model, assetId) {
        var assetLabel = (make) ? (make + " ") : "";
        assetLabel += (model) ? (model + " - ") : "";
        assetLabel += assetId;
        return assetLabel;
    }

    /* *********************** Tickets *************************/

    vm.myCellRenderer  = function(params){
        return '<div><a target="_blank" href="https://support.zoho.com'+params.value+'">https://support.zoho.com'+params.value+'</a></div>'
    }

    vm.colDef = [
        {headerName: "Id", field: "id", editable : false},
        {headerName: "Case Id", field: "caseId", editable : false, hide: true},
        {headerName: "Subject", field: "subject", editable : false},
        {headerName: "Status", field: "status", cellEditor: "select",
         cellEditorParams: {
             values: ["On hold", "Open", "Escalated", "Closed"]
         }},
        {headerName: "Creation Date", field: "creationDate", editable : false},
        {headerName: "URI", field: "uri", editable : false, cellRenderer: function (params) {  
            return vm.myCellRenderer(params);
        }
        }]
    
    
    vm.changeTicketStatus = function(data) {
        console.log(data)
    }

    vm.ticketsCallback = function(data){
        var ticketsData = [];
        var rows = [];
        try{
            rows = JSON.parse(data).response.result.Cases.row;
            if(!Array.isArray(rows)){
                rows = [rows];
            }
            for(var i = 0 ; i < rows.length; i++){
                var row = JSON.parse(data).response.result.Cases.row;
                if(!Array.isArray(row)){
                    row = [row]
                }
                row = row[i].fl;
                var ticketData = {}
                for(var k = 0; k < row.length;k++){
                    var content = row[k].content;
                    switch(row[k].val){
                        case "Subject":
                            ticketData["subject"]  = content;
                            break;
                        case "URI":
                            ticketData["uri"]  = content;
                            break;
                        case "Ticket Id":
                            ticketData["id"] = content;
                            break;
                        case "Status":
                            ticketData["status"] = content;
                            break;
                        case "Created Time":
                            ticketData["creationDate"] = content;
                            break;
                        case "Contact Name":
                            ticketData["contactName"] = content;
                            break;
                        case "CASEID":
                            ticketData["caseId"] = content;
                            break;
                    }
                }
                ticketsData.push(ticketData);
            }
            return {"documents" : ticketsData , count: ticketsData.length}
        }catch(e){
            console.log(e);
        }
    }
});

myApp.controller('notificationCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.user = JSON.parse($.cookie('user')).login //(atob(document.cookie.split("=")[1]).split(":")[1])
    vm.menuItems = menuItemsJson;
    vm.params = {} 
	$scope.$parent.vm.showList = false;
    httpClient
        .get("smartkitchens/api/notifications/getSettings", null)
        .then(
        function(data, response) {
            if(data && (data.emails || data.mobiles)){
                vm.emails= [];//data.emails;
                vm.mobiles = []; //data.mobiles;
                for(var i = 0; i < data.emails.length; i++){
                    vm.emails.push({"text":data.emails[i]});
                }
                for(var i = 0; i < data.mobiles.length; i++){
                    vm.mobiles.push({"text":data.mobiles[i]});
                }
            }else{
                vm.emails = [];
                vm.mobiles = [];
            }
            console.log('SUCCESS');
        },
        function(err) {
            console.log('ERROR');
        });

    vm.buildParams = function(){
        var emailsArray = [];
        var mobilesArray = [];
        for(var i = 0; i < vm.emails.length; i++){
            emailsArray.push(vm.emails[i]["text"]);
        }
        for(var i = 0; i < vm.mobiles.length; i++){
            mobilesArray.push(vm.mobiles[i]["text"]);
        }
        vm.params["emails"] = emailsArray;
        vm.params["mobiles"] = mobilesArray;
    } 

});

myApp.controller('batteryLevelCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.user = JSON.parse($.cookie('user')).login //(atob(document.cookie.split("=")[1]).split(":")[1])
    vm.menuItems = menuItemsJson;
    $scope.$parent.vm.showList = false;
    vm.tab = '35';
    vm.batteryParams = {batteryL1: true}
    vm.batteryColDef = [
        {headerName: "Id", field: "id"},
        {headerName: "Building", field: "building"},
        {headerName: "Battery Level", field: "batteryLevel"},
        {headerName: "Latitude", field: "latitude", hide: true},
        {headerName: "Location", field: "longitude", cellRenderer: function (params) {  
            return vm.locationCellRenderer(params);
        }}]

    vm.locationCellRenderer = function(param){
        return '<span>{' + param.data.longitude + ', ' + param.data.latitude + '}</span>'
    }

    vm.batteryFormatData = function(data){
        return {documents: data, count: data.length}
    }

    vm.showData = function(param){
        if(param == 35){
            vm.batteryParams = {batteryL1: true}
        } else if(param == 25){
            vm.batteryParams = {batteryL2: true}  
        } else if(param == 15){
            vm.batteryParams = {batteryL3: true}
        }
        $scope.$broadcast('updateGridData', {params: vm.batteryParams});  
    }

});

myApp.controller('temperatureLevelCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.user = JSON.parse($.cookie('user')).login //(atob(document.cookie.split("=")[1]).split(":")[1])
    vm.menuItems = menuItemsJson;
    $scope.$parent.vm.showList = false;
    vm.temperatureColDef = [
        {headerName: "Id", field: "id"},
        {headerName: "Building", field: "building"},
        {headerName: "Temperature", field: "temperature"},
        {headerName: "Latitude", field: "latitude", hide: true},
        {headerName: "Location", field: "longitude", cellRenderer: function (params) {  
            return vm.locationCellRenderer(params);
        }}]

    vm.locationCellRenderer = function(param){
        return '<span>{' + param.data.longitude + ', ' + param.data.latitude + '}</span>'
    }

    vm.temperatureFormatData = function(data){
        return {documents: data, count: data.length}
    }
});

myApp.controller('tamperedWithlCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.user = JSON.parse($.cookie('user')).login //(atob(document.cookie.split("=")[1]).split(":")[1])
    vm.menuItems = menuItemsJson;
    $scope.$parent.vm.showList = false;
    vm.tamperedWithColDef = [
        {headerName: "Id", field: "id"},
        {headerName: "Building", field: "building"},
        {headerName: "Tampered With Date", field: "tamperDate"},
        {headerName: "Latitude", field: "latitude", hide: true},
        {headerName: "Location", field: "longitude", cellRenderer: function (params) {  
            return vm.locationCellRenderer(params);
        }}]

    vm.locationCellRenderer = function(param){
        return '<span>{' + param.data.longitude + ', ' + param.data.latitude + '}</span>'
    }

    vm.tamperedWithFormatData = function(data){
        return {documents: data, count: data.length}
    }
});

myApp.controller('fridgeRuleCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson, $sce, $routeParams, $timeout) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.user =  JSON.parse($.cookie('user')).login //(atob(document.cookie.split("=")[1]).split(":")[1]);
    vm.menuItems = menuItemsJson;
	$scope.$parent.vm.showList = false;

    var params = {};

    params["scriptName"] = $routeParams.id;
    
    vm.editorUrl = null;
    httpClient
        .get("smartkitchens/api/rules/getGenericRuleEditor", null)
        .then(
        function(data, response) {
            vm.editorUrl = data;
            if(params["scriptName"]){
                vm.rulesrc = $sce.trustAsResourceUrl(data +  '/fridge_' + params["scriptName"]+"&pluginName=blockly");
            }else{
                vm.rulesrc = $sce.trustAsResourceUrl(data +  '/fridge_generic&pluginName=blockly');
            }
            
              $timeout(function() {
               $(".loading-frame").css("display", "none")
               $(".allFrame").css("display","")
            }, 2000)
            
        },
        function(err) {
            console.log('ERROR');
        });
    
});

myApp.controller('ovenRuleCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson, $sce, $routeParams, $timeout) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.menuItems = menuItemsJson;
	$scope.$parent.vm.showList = false;

    var params = {};

    params["scriptName"] = $routeParams.id;
    
     vm.editorUrl = null;
    httpClient
        .get("smartkitchens/api/rules/getGenericRuleEditor", null)
        .then(
        function(data, response) {
            vm.editorUrl = data;
            if(params["scriptName"]){
                vm.rulesrc = $sce.trustAsResourceUrl(data +  '/oven_' + params["scriptName"]+"&pluginName=SimpleDecisionTable");
            }else{
                vm.rulesrc = $sce.trustAsResourceUrl(data +  '/oven_generic&pluginName=SimpleDecisionTable');
            }
            
              $timeout(function() {
               	$(".loading-frame").css("display", "none")
               	$(".allFrame").css("display","")
            }, 2000)
        },
        function(err) {
            console.log('ERROR');
        });
    

});

myApp.controller('temperatureRuleCtrl', function($scope, httpClient, headerItemsJson, menuItemsJson, $sce, $routeParams, $timeout) {
    var vm = this;
    vm.headerItems = headerItemsJson;
    vm.menuItems = menuItemsJson;
	$scope.$parent.vm.showList = false;

    var params = {};

    params["scriptName"] = $routeParams.id;
    
     vm.editorUrl = null;
    httpClient
        .get("smartkitchens/api/rules/getGenericRuleEditor", null)
        .then(
        function(data, response) {
            vm.editorUrl = data;
            if(params["scriptName"]){
                vm.rulesrc = $sce.trustAsResourceUrl(data +  '/temp_humidity_' + params["scriptName"]+"&pluginName=SimpleDecisionTable");
            }else{
                vm.rulesrc = $sce.trustAsResourceUrl(data +  '/temp_humidity_generic&pluginName=SimpleDecisionTable');
            }
            
             $timeout(function() {
               $(".loading-frame").css("display", "none")
               $(".allFrame").css("display","")
            }, 2000);
        },
        function(err) {
            console.log('ERROR');
        });
    

});
