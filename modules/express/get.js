// File for GET funcitons of Express
exports.getStatus = (discordStatus) => {
        // var1 = botstatus
        let random = Math.random() * 10;
        translateStatus = "Unknown";

        items = [
            "I'm a teapot",
            "If you have found a lost Harvi, please return him to the nearest ASE moderator",
            "Minions. Minions everywhere",
            "Karlsson says hi",
            "The Arma 3 map of Altis is based on the real-life Greek island called Lemnos, while the map Stratis is based on the island called Agios Efstratios"
        ]
    
        switch (discordStatus) {
            case 0: 
                translateStatus = "Connected";
                break;
            case 1:
                translateStatus = "Connecting";
                break;
            case 2:
                translateStatus = "Reconnnecting";
                break;
            case 3:
                translateStatus = "Idle";
                break;
            case 4:
                translateStatus = "Nearly";
                break;
            case 5:
                translateStatus = "Disconnected";
                break;
            default:
                translateStatus = "Unknown, check process status";
        }
        expressStatus = 200;
        message = "";
        if (random > 9) {
            message = items[Math.floor(Math.random()*items.length)];
            if (message == items[0]) {
                expressStatus = 418;
            }
        }

        if (random > 9) {
            return {"express": expressStatus, "discord": translateStatus, "message": message};
        } else {
            return {"express": expressStatus, "discord": translateStatus};
        }
}