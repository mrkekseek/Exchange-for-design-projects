(function(){

	angular.module("app")
		.controller("CatalogCtrl", ['$scope', '$location', '$timeout', 'request', '$uibModal', '$window', '$route', CatalogCtrl]);


	function CatalogCtrl($scope, $location, $timeout, request,  $uibModal, $window, $route)
	{
		$scope.sorts = {
			'default-desc' : {
				name : 'Domyślny',
				active : $scope.isActive("/projects/my/") || $scope.isActive("/projects/bought/") ? true : false
			},
			'created_at-desc' : {
				name : 'Najnowsze',
				active : true
			},
			'buys-desc' : {
				name : 'Popularność',
				active : true
			},
			'price-asc' : {
				name : 'Cena - rosnąco',
				active : true
			},
			'price-desc' : {
				name : 'Cena - malejąco',
				active : true
			},
			'rating-desc' : {
				name : 'Ocena projektu',
				active : true
			},
			'comments-desc' : {
				name : 'Liczba komentarzy',
				active : true
			}
		};

		$scope.designers = {};
		$scope.catalogs = [];
		$scope.tags = {};
		$scope.projects = [];
		$scope.groups = {};
		$scope.filter = {
			sort : $scope.isActive("/projects/my/") || $scope.isActive("/projects/bought/") ? 'default-desc' : 'created_at-desc',
			designer : 0,
			catalog : 1,
			tags : {}
		};

		$scope.group_hover = [];
		$scope.hover = [];
		$scope.action = [];
		$scope.edit = {
			tags : [],
			cats : []
		};

		$scope.adding = {
			tags : { 
				groups : {
						value : "",
						toggle : false
				}, 
				tags : {
					value : "",
					toggle : false
				}
			}
		};
		
		$scope.hash = {
			set : function(option, value)
			{
				var filter = $scope.hash.get();
				var check = false;
				for(var f in filter)
				{
					if (filter[f].key == option)
					{
						filter[f].key = option;
						filter[f].value = value;
						check = true;
					}
				}
	
				if ( ! check)
				{
					filter.push({
						key : option,
						value : value
					});
				}

				$location.hash(filter.map(function(index){
					if (index.value) {
						return index.key + "=" + index.value;
					}
				}));
			},
			get : function()
			{
				var filter = window.location.hash.replace("#", "").split(',');
				filter = filter != false ? filter : [];
				filter = filter.map(function(index){
					var option = index.split('='); 
					return { key : option[0], value : option[1]};
				});
				return filter;
			},
			remove : function(key)
			{
				// var filter = $scope.hash.get(),
				// 	list = [];
				// for(var f in filter) {
				// 	if (filter[f].key != key) {
				// 		list.push(filter[f]);
				// 	}
				// }
				
				// $location.hash(list.map(function(index){
				// 	if (index.value) {
				// 		return index.key + "=" + index.value;
				// 	}
				// }));
			}
		}

		$scope.read_filter = function() {
			var filter = $scope.hash.get();
			for(var f in filter)
			{
				if($scope.filter[filter[f].key])
				{
					if (filter[f].key == "tags")
					{
						var tags = {};
						tmp = filter[f].value.split('+');
						for(var f in tmp)
						{
							tags["" + tmp[f]] = true;
						}
						$scope.filter.tags = tags;
					} 
					else 
					{
						$scope.filter[filter[f].key] = filter[f].value;
					}
				}
			}		
		}

		window.onhashchange = function() {
			$scope.read_filter();
		}

		$scope.set_tags_filter = function(tags)
		{
			$scope.$watch('filter.tags', function() {

				var checked = 0,
					filter = $scope.filter.tags;

				for(var i in filter) {
					if (filter[i]) {
						checked ++;
					}
				}
				
				if ( ! checked) {
					
					var filter = $scope.hash.get().filter(function(a){ return a.key == "tags" ? false : true; });
				
					$location.hash(filter.map(function(index){
						if (index.value) {
							return index.key + "=" + index.value;
						}
					}));
				}

				if($scope.filter.tags) {
					var tags = [];
					for(var i in $scope.filter.tags)
					{
						if($scope.filter.tags[i])
						{
							tags.push(i);
						}
					}

					if(tags.length)
					{
						$scope.hash.set("tags", tags.join('+'));
					}
				}
			});	
		}

		$scope.set_catalog_filter = function(catalog)
		{
			setTimeout(function(){
				$scope.hash.set('catalog', catalog);
			}, 0);

			$scope.filter.tags = {};
			var filter = $scope.hash.get();
			filter = filter.filter(function(i){ return i.key != "tags" ? true : false; });
			
			$location.hash(filter.map(function(index){
				if (index.value) {
					return index.key + "=" + index.value;
				}
			}));
		}
		
		$scope.get_catalogs = function()
		{
			request.send('/catalogs/get_all', {}, function(data){
				$scope.catalogs = data;
			});
		}

		$scope.get_catalogs();

		$scope.get_tags = function()
		{
			request.send('/tags/get_all', {}, function(data){
				$scope.tags = data;
			});
		}

		$scope.get_tags();

		$scope.get_groups = function()
		{
			request.send('/tags/get_groups', {}, function(data){
				$scope.groups = data;
			});
		}

		$scope.get_groups();

		$scope.get_designers = function()
		{
			request.send('/users/get_designers', {}, function(data){
				$scope.designers = data;
			});
		}

		$scope.get_designers();

		$scope.get_projects = function()
		{
			var segments = window.location.pathname.replace(/\/$/g, '').split('/');
			request.send('/projects/get_all', {'page' : segments.pop()}, function(data){
				$scope.projects = data;
				$scope.read_filter();
			});
		}

		$scope.get_projects();

		$scope.add_favorit = function(project_id)
        {
	        request.send('/projects/add_favorit', { 'project_id' : project_id }, function(data){
				$scope.get_user();
				$scope.get_projects();
	        });
		}

		$scope.update_catalog = function(catalog)
		{
			request.send('/catalogs/update_catalog', { 'catalog' : catalog }, function(response){
				$scope.get_catalogs();
			});
		}

		$scope.delete_catalog = function(id)
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
						request.send('/catalogs/delete', { 'catalog_id' : id }, function(response){
							$scope.cancel();
						});
					}
				},
				size: 'sm',
				resolve: {}
		    });

		    modalInstance.result.then(function(response) {
				$scope.get_catalogs();
		    }, function () {
				$scope.get_catalogs();
			});
		}

		$scope.add_catalog = function()
		{
			request.send('/catalogs/add_catalog', { 'name' : $scope.adding.catalog.vlaue }, function(response){
				$scope.adding.catalog.vlaue = "";
				$scope.get_catalogs();
			});
		}

		$scope.update_tags = function(tags)
		{
			request.send('/tags/update_tags', { 'tags' : tags }, function(response){
				$scope.get_tags();
			});
		}

		$scope.delete_tag = function(tag, tags_id)
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
						request.send('/tags/delete_tags', {'tag' : tag, 'tags_id' : tags_id}, function(response){
							$scope.cancel();
						});
					}
				},
				size: 'sm',
				resolve: {}
		    });

		    modalInstance.result.then(function(response) {
				$scope.get_tags();
		    }, function () {
				$scope.get_tags();
			});
		}

		$scope.tags_adding = {
			show : [],
			value : []
		};
		
		$scope.add_tags = function(group_id)
		{
			request.send('/tags/add_tag', {'group_id' : group_id, 'catalog_id' : $scope.filter.catalog, 'name' : $scope.tags_adding.value[group_id] }, function(response){
				$scope.tags_adding.value[group_id] = "";
				$scope.get_tags();
			});
		}

		$scope.add_groups_tags = function()
		{
			request.send('/tags/add_groups_tag', {'catalog_id' : $scope.filter.catalog, 'name' : $scope.adding.tags.groups.value}, function(response){
				$scope.adding.tags.groups.value = "";
				$scope.get_groups();
				$scope.get_tags();
			});
		}

		$scope.object_keys = function(obj)
		{
			if (obj)
			{
				return Object.keys(obj);
			}
		}

		$scope.filter_image = function(files, type)
		{
			var tmp = [];
			for(var i in files)
			{
				if (files[i].type == type)
				{

(function(){

	angular.module('app')
		.filter('by_tags', function(){
			return function(projects, filter)
			{
				var checked = 0;

				for(var i in filter) {
					if (filter[i]) {
						checked ++;
					}
				}
				
				if ( ! checked) {
					return projects;
				}

				return projects.filter(function(p) {
					return p.tags.some(function(t){ return Object.keys(filter).indexOf("" + t.id) + 1; });
				});
			}
		});

})();

(function(){
	angular.module("app")
		.filter("by_sort", function(){
			return function(projects, filter){
				
				var part = filter.split("-"),
					field = part[0],
					sort = part[1];

				if (['price', 'created_at', 'rating', 'buys', 'comments'].indexOf(field) + 1) {
					if (field == 'rating') {
						for(var i in projects) {
							var sum = 0;
							for(var j in projects[i].ratings) {
								sum += projects[i].ratings[j].rating;
							}
							projects[i].rating = sum;
						}
					}

					if (['comments', 'buys'].indexOf(field) + 1) {
						for(var i in projects) {
							projects[i][field + '-tmp'] = projects[i][field].length ? projects[i][field].length : 0;
						
						}	
						field = field + '-tmp';
					}

					projects.sort(function(x, y){
                        return x[field] - y[field];
                    });
				}

				if (sort != 'asc')
				{
					projects.reverse();
				}
				
				return projects;
			};
		});
})();