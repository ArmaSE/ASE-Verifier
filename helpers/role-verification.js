exports.verifyRolePermission = (guildObject, permissionResolvable) => {
    permissionCheck = guildObject.me.hasPermission(permissionResolvable);

    if (permissionCheck) {
        console.log(`> [RoleHelper:RolePermissions] Bot has permission: ${permissionResolvable}`);
        return true;
    } else {
        console.log(`> [RoleHelper:RolePermissions] Bot lacks permission: ${permissionResolvable}`);
        return false;
    }
}