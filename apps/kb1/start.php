<?php

	$app = $_GET["app"];

	if (!is_dir("apps/" . $app)) 
		die ("Application ['$app'] is not found!");
		
	include_once("utils.php"); 

	if (sessionStart($app)){
		header("Location: " . "apps/" . $app . "/main.html");
	}else
		echo ("Couldn't add application ['$app'] to sessions table");

?>