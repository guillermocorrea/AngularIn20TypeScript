((): void => {

    angular.module('demoApp', ['ngRoute', 'ngAnimate']); 

    angular.module('demoApp').config(['$routeProvider', ($routeProvider) => {
        $routeProvider.when('/',
            {
                controller: 'demoApp.CustomersController',
                templateUrl: 'app/views/customers.html',
                controllerAs: 'vm'
            })
            .when('/orders/:customerId',
                {
                    controller: 'demoApp.OrdersController',
                    templateUrl: 'app/views/orders.html',
                    controllerAs: 'vm'
                });
    }]);

})();
