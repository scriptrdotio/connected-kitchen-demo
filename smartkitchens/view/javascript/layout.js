var menuItems = {
  "mainMenu": "menu1",
  "menu1": [
    {"id":"1", "iconClass":"fa fa-globe", "label": "Map", "route":"#/map", "active":"true"},
    {"id":"2", "iconClass":"fa fa-dashboard", "label": "Dashboard", "route":"#/dashboard", "active":"false", "sub": "col2"},
    {"id":"1", "iconClass":"fa fa-list-alt", "label": "Generic Rules", "route":"#/rules", "active":"false", "sub": "col4"}
  ],
  "col2": [
    {"id":"6", "iconClass":"fa fa-clock-o", "label":"Real Time", "route":"#/realTime", "active":"false"},
    {"id":"7", "iconClass":"fa fa-file-text-o", "label": "Logs", "route":"#/logs", "active":"false"},  
    {"id":"8", "iconClass":"fa fa-ticket", "label":"Tickets", "route":"#/tickets", "active":"false"}
  ],
  "col3": [
    {"id":"7", "iconClass":"fa fa-thermometer-2", "label": "High Temperature", "route":"#/highTemperature", "active":"false"}
  ],
   "col4": [
    {"id":"6", "iconClass":"fa fa-lock", "label":"Fridge Door rule", "route":"#/fridgeRule", "active":"false"},
    {"id":"6", "iconClass":"fa fa-lock", "label":"Oven Door rule", "route":"#/ovenRule", "active":"false"},   
    {"id":"7", "iconClass":"fa fa-thermometer-2", "label": "Temp/Humidity rule", "route":"#/temperatureRule", "active":"false"}
  ]  
}; 

var headerItems = {
    "logo": "//blog.scriptr.io/wp-content/uploads/2016/10/logo-1.png",
    "items": [],
    "subitems": [
        {"id":"1", "iconClass":"fa fa-bell", "label": "Notification Rules", "route":"#/notifications", "active":"false"} 
    ], 
    "logout": {"icon": "fa fa-sign-out", "label": "Logout", "route":"#/logout"}
};

var routingItems = {
  "params": [
    {"route": "map", "template": "/smartkitchens/view/html/views/map/map.html"},
    {"route": "realTime", "template": "/smartkitchens/view/html/views/dashboard/realTime.html"},
    {"route": "logs", "template": "/smartkitchens/view/html/views/dashboard/logs.html"},  
    {"route": "tickets", "template": "/smartkitchens/view/html/views/dashboard/tickets.html"},
    {"route": "notifications", "template": "/smartkitchens/view/html/views/notifications/notifications.html", controller: "notificationCtrl as vm"},
    {"route": "highTemperature", "template": "/smartkitchens/view/html/views/reports/temperature.html", controller: "temperatureLevelCtrl as vm"},    
    {"route": "fridgeRule", "template": "/smartkitchens/view/html/views/genericRules/genericFridgeRule.html", controller: "fridgeRuleCtrl as vm"},  
    {"route": "ovenRule", "template": "/smartkitchens/view/html/views/genericRules/genericOvenRule.html", controller: "ovenRuleCtrl as vm"},    
    {"route": "temperatureRule", "template": "/smartkitchens/view/html/views/genericRules/genericAllRule.html", controller: "temperatureRuleCtrl as vm"},    
    {"route": "logout", "template": "/smartkitchens/view/html/logout.html"},  
  ],
  "otherwiseOption" : {"template": "/"}
};
