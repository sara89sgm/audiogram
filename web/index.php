<?php
// DISABLE THIS IN PRODUCTION
use Symfony\Component\Debug\Debug;


// ENABLE THIS IN PRODUCTION
// ini_set('display_errors', 0);

require_once __DIR__.'/../vendor/autoload.php';

// DISABLE THIS IN PRODUCTION
Debug::enable();

$app = new Silex\Application();

//require __DIR__.'/../src/DBController.php';

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views'
));

$app['debug'] = true;

$app->get('/', function() {
    return 'Hello!';
});
$app->get('/php', function() {
    return phpinfo();
});

$app->get('/home', function() use ($app) {
    return $app['twig']->render('index.twig');
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
