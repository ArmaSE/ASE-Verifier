// File for GET funcitons of Express
exports.getStatus = (discordStatus) => {
        // var1 = botstatus
        let random = Math.random() * 10;
        translateStatus = "Unknown";
    
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
            case 4:
                translateStatus = "Disconnected";
                break;
            default:
                translateStatus = "Unknown, check process status";
        }
        expressStatus = 200;
        if (random > 8) {
            expressStatus = "418: I'm a teapot";
        }
    
        return {"expressStatus": expressStatus, "discordStatus": translateStatus};
}