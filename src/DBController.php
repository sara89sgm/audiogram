<?php

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'dbs.options' => array(
    	'mysql_read' => array(
	        'driver' => 'pdo_mysql',
	        'dbhost' => 'localhost',
	        'dbname' => 'rif',
	        'user' => 'root',
	        'password' => '',
	        'port' => '3306',
	    ),
    ),
));

?>