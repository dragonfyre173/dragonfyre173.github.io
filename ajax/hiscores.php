<?php
        error_reporting(1);
        $user = urldecode($_GET['user']);
        if(isset($_GET['callback'])) $callback = $_GET['callback'];

        function getStats($name) {
        $hiscores = array("Overall",
        "stats" => array(
        "Attack", "Defence", "Strength",
        "Hitpoints", "Ranged", "Prayer",
        "Magic", "Cooking", "Woodcutting",
        "Fletching", "Fishing", "Firemaking",
        "Crafting", "Smithing", "Mining",
        "Herblore", "Agility", "Thieving",
        "Slayer", "Farming", "Runecrafting",
        "Hunter", "Construction", "Summoning",
        "Dungeoneering"
        ),
        "minigames" => array(
        "Duel Tournaments", "Bounty Hunters",
        "Bounty Hunter Rogues", "Fist of Guthix",
        "Mobilising Armies", "B.A Attackers",
        "B.A Defenders", "B.A Healers",
        "Castle Wars Games", "Conquest"
        )
        );
        $name = strtolower($name);
        $connection = fopen('http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player='.$name, 'rb');
        if($http_response_header[0] === 'HTTP/1.1 200 OK') {
        $data = stream_get_contents($connection);
        $data = explode("\n", $data);
        $overall = explode(',', $data[0]);
        $stats['overall'] = array("Rank" => $overall[0], "Level" => $overall[1], "XP" => $overall[2]);
        for($i = 0; $i < 25; $i++) {
        $cItem = $hiscores['stats'][$i];
        $num = explode(',', $data[$i+1]);
        $stats['skills'][$cItem] = array("Rank" => $num[0], "Level" => $num[1], "XP" => $num[2]);
        }
        for($i = 0; $i < 9; $i++){
        $cItem = $hiscores['minigames'][$i];
        $num = explode(',', $data[$i+27]);
        $stats['minigames'][$cItem] = array("Rank" => $num[0], "Score" => $num[1]);
        }

        $stats = json_encode($stats);
        $stats = str_replace('-1', '', $stats);
        if($_GET['lowercase'] === 'yes'){
        $stats = strtolower($stats);
        }
        return $stats;
        }
        else {
        return '{"error":"User not found"}';
        }
        fclose($connection);
        }

        if(isset($_GET['user'])) {
        $cStats = getStats($user);
        if(isset($callback)) {
        echo $callback.'('.$cStats.')';
        }
        else
        {
        echo $cStats;
        }
        }
        else
        {
        echo '?????????????????????????????????????????????????????????????';
        } ?>