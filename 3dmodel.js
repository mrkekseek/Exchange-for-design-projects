$scope.get_proejct = function()
{
    request.send("/projects/get", { id : $route.current.params.param }, function(response){
        $scope.project = response;
        
        $scope.panorama.list = [];
        var list = $scope.filter_image($scope.project.files, 'panorama');
        for(var i in list)
        {
            $scope.panorama.list.push(list[i]);
        }

        if ($scope.panorama.list.length)
        {
            var cube = [];
            for(var i in $scope.panorama.list)
            {
                cube.push("/storage/" + $scope.panorama.list[i].file.replace("public/", ""));
            }

            var last = cube.pop(),
                prelast = cube.pop();
            
            cube.push(last);
            cube.push(prelast);

            if (cube.length)
            {
                $scope.toggle.preview = 0;
                pannellum.viewer('panorama', {
                    "type": "cubemap",
                    "autoLoad": true,
                    "showFullscreenCtrl":true,
                    "showZoomCtrl":true,
                    "autoRotate": 1,
                    "autoRotateInactivityDelay": 3000,
                    "orientationOnByDefault" : false,
                    
                    "cubeMap": cube		
                });	
            }
        }
        
        $scope.project.previews = $scope.filter_image($scope.project.files, 'preview');
        $scope.add_views();
        $scope.get_notifications();
    });
}
