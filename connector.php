<?php 

$action = $_GET['action'];

if($action === "get"){
	$issue = $_GET['issue'];
	$id = $_GET['id'];
	$filename = "texts/$issue/$id.json";
	$filepath = realpath($filename);
	$textdir = realpath("texts/");
	
	if(!substr($filepath, 0, strlen($textdir)) === $textdir){
		echo '{"title":"FEHLER","content":"TEXTE MÜSSEN IM texts-UNTERVERZEICHNIS LIEGEN."}';
	} elseif(is_readable($filepath)){
			echo file_get_contents($filepath);
	} else {
		echo '{"title":"","content":""}';
	}
} elseif($action === "save"){
	$issue = $_POST['issue'];
	$id = $_POST['id'];
	$json = $_POST['json'];
	
	if ((strpos($issue,'/') !== false) || (strpos($id,'/') !== false)) {
		echo '{"title":"FEHLER","content":"id UND issue DÜRFEN KEIN / ENTHALTEN!"}';
		die();
	}
	
	$filename = "texts/$issue/$id.json";
	
	if(!is_dir("texts/$issue")){
		mkdir("texts/$issue");
		if(!is_dir("texts/$issue")){
			echo '{"title":"FEHLER","content":"VERZEICHNIS KONNTE AUF DEM SERVER NICHT ANGELEGT WERDEN."}';
			die();
		}
	}
	
	if(file_exists($filename) && !is_writable($filename)){
		echo '{"title":"FEHLER","content":"DATEI '.$filename.' KONNTE AUF DEM SERVER NICHT ÜBERSCHRIEBEN WERDEN."}';
	} else {
		$success = file_put_contents($filename, $json);
		if($success == false){
			echo '{"title":"FEHLER","content":"DATEI '.$filename.' KONNTE AUF DEM SERVER NICHT ERSTELLT WERDEN."}';
		} else {
			echo '{"title":"ERFOLGREICH","content":"Datei '.$filename.' wurde gespeichert."}';
		}
	}
	
} else {
	echo '{"title":"FEHLER","content":"ALS AKTION SIND NUR get UND save ERLAUBT!"}';
}
?>