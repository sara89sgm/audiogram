<?php
// DISABLE THIS IN PRODUCTION
use Symfony\Component\Debug\Debug;


// ENABLE THIS IN PRODUCTION
// ini_set('display_errors', 0);

require_once __DIR__.'/../vendor/autoload.php';
use Parse\ParseClient;
use Parse\ParseQuery;
use Parse\ParseObject;
 
ParseClient::initialize('u4iFjc0mVSgWBiNYJkDgXzeXbKAGIqoz44tGJsAj', 'l5KOSxl9eEDLG2k8ebnfFFLlyYVNv2tPWiCq4tNq', 'cEoeKfQHEH3NIpTdgF5PlOtPyH7Emn27i8IpvW69');
date_default_timezone_set('Europe/Madrid');

// DISABLE THIS IN PRODUCTION
Debug::enable();

$app = new Silex\Application();

//require __DIR__.'/../src/DBController.php';

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views'
));

$app['debug'] = true;

$app->get('/php', function() {
    return phpinfo();
});

$app->get('/', function() use ($app) {

    $parse = new ParseQuery('AudiogramItem');
    $parse->limit(20);  
    $parse->ascending("createdAt"); 
    $results = $parse->find();
    //var_dump($results);
    //die;
    return $app['twig']->render('index.twig', array('audiogramitems' => $results));
});



// $app->get('/journal', function () use ($app) {
// 	$post = $app['dbs']['mysql_read']->fetchAll('SELECT * from journals');

// 	return $app['twig']->render('index.twig', array(
//         'journals' => $post,
//     ));
// });

// $app->get('/journal/{id}', function ($id) use ($app) {
// 	$journal_details = $app['db']->fetchAssoc("SELECT * FROM journals WHERE id = ?", array((int) $id));
//     $journal_data = $app['db']->fetchAssoc("SELECT year, impact_factor FROM impact_factor WHERE journal_id = ?", array((int) $id));

//     return $app['twig']->render('journal.twig', array(
//         'journal_details' => $journal_details,
//         'journal_data' => json_encode($journal_data)
//     ));
// });

$app->run();
