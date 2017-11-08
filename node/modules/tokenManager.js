var manager = {};

let tokens = {};

module.exports = manager;

/**
 * retrieves the token for specified owner. 
 * If the token is not stored it will return "undefined"
 * @param {String} owner //owner for which token is asked.
 */
manager.getToken = function(owner){
    if(tokens.hasOwnProperty(owner)){
        console.log(tokens[owner]);
    }
    return tokens[owner];
}

/**
 * stores the token for the specified owner
 * @param {String} owner //owner/user
 * @param {String} token //token to be stored
 */
manager.addToken = function(owner, token){
    tokens[owner] = token;    
}