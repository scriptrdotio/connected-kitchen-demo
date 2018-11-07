var login = {
   redirectTarget: "/smartkitchens/view/html/index.html",
   expiry:6,
   loginTarget: "/smartkitchens/view/html/login.html",
   loginApi: "/smartkitchens/api/login/login",
   validateTokenApi: "/smartkitchens/api/login/validateToken"
};

var wssConfig = ["wsClientProvider",function (wsClientProvider) {
    wsClientProvider.setPublishChannel("requestChannel");
    var subscribeChannels = ["responseChannel"]
    var userGroups = JSON.parse($.cookie('user')).groups;
    var groups = (userGroups)? ((typeof userGroups == 'string') ?  [userGroups] : userGroups) :[];
    groups.forEach(function(value){
        subscribeChannels.push("responseChannel_"+value);
    })
    wsClientProvider.setSubscribeChannel(subscribeChannels);
}];

var httpsConfig = ["httpClientProvider",function (httpClientProvider) {
}]




