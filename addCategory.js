tmp.push(files[i]);
}
}
return tmp;
}

$scope.delete_groups_tags = function(group_id)
{
var modalInstance = $uibModal.open({
animation: true,
templateUrl: 'ConfirmDelete.html',
controller: function($scope, $uibModalInstance, $uibModal) {
    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    }
    
    $scope.delete = function() {
        request.send('/tags/delete_groups_tags', {'group_id' : group_id}, function(response){
            $scope.cancel();
        });
    }
},
size: 'sm',
resolve: {}
});

modalInstance.result.then(function(response) {
$scope.get_groups();
$scope.get_tags();
}, function () {
$scope.get_groups();
$scope.get_tags();
});
}

$scope.update_groups_tags = function(group)
{
request.send('/tags/update_groups_tags', {'group' : group}, function(response){
$scope.get_groups();
$scope.get_tags();
});
}

}

})();
