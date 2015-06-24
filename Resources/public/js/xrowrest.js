/**
 * get parameters via ajax for set our js oauth2 client
 * you have to define client_id, client_secret and loginform id for your loginform, to get here username and password
 * -> parameters.yml:
 *        oauth_client_id: xyz
          oauth_client_secret: xyz
 * 
 * you can define a callback function after generating and saving an access token
 * -> parameters.yml
 *        oauth_callback_function_if_token_is_set: logoutUser
 */
if (typeof oa_params_cl != "undefined" && typeof oa_params_clsc != "undefined") {
    var settings = {"client_id": oa_params_cl,
                    "client_secret": oa_params_clsc,
                    "tokenURL": "/oauth/v2/token",
                    "authURL": "/xrowapi/v1/auth",
                    "apiUserURL": "/xrowapi/v1/user",
                    "apiLogoutURL": "/xrowapi/v1/logout"},
        callbackFunctionIfTokenIsSet = '';
    if (typeof callbackFunctionIfToken != "undefined")
        callbackFunctionIfTokenIsSet = callbackFunctionIfToken;
    require(["jso/jso"], function(JSO) {
        var jsoObj = new JSO({
            client_id: settings.client_id,
            scopes: ["user"],
            authorization: settings.authURL
        });
        JSO.enablejQuery($);
        var token = jsoObj.checkToken();
        if (token !== null) {
            if (token.access_token) {
                if(callbackFunctionIfTokenIsSet != '') {
                    if (typeof window[callbackFunctionIfTokenIsSet] == "function" ) {
                       window[callbackFunctionIfTokenIsSet](jsoObj, settings);
                   }
               }
           }
        }

        /**
         * you need a form with class use-api-logn 
         * and two login fields: username and password
         * you can also define a redirect url after the login in your template like this
         * <input type="hidden" value="/redirect/onthis/server/with/ssl" data-protocol="https" />
         */
        $(document).ready(function(){
            if ($('form.use-api-login').length) {
                $('form.use-api-login').each(function() {
                    $(this).submit(function(e){
                        e.preventDefault();
                        var loginForm = $(this),
                            counterGetToken = 0;
                        sfLoginForm(loginForm, function(getTokenData){
                            if (typeof getTokenData === "string") {
                                var queryHash = "#" + getTokenData.split("?"); 
                                jsoObj.callback(queryHash, false);
                            }
                            if (counterGetToken == 0) {
                                counterGetToken++;
                                var token = jsoObj.checkToken();
                                if (token !== null) {
                                    if (typeof token.access_token != "undefined") {
                                        var redirectAfterApiLoginObject = loginForm.find('input[name="redirectAfterApiLogin"]');
                                        if (redirectAfterApiLoginObject.length) {
                                            var redirectAfterApiLogin = redirectAfterApiLoginObject.val();
                                            // if value of redirect does not have /
                                            if (!redirectAfterApiLogin.match(/^http/) && !redirectAfterApiLogin.match(/^\//))
                                                redirectAfterApiLogin = '/'+redirectAfterApiLogin;
                                            // <input type="hidden" value="/redirect/onthis/server/with/ssl" data-protocol="https" />
                                            if (redirectAfterApiLoginObject.data('protocol') && !redirectAfterApiLogin.match(/^http/))
                                                redirectAfterApiLogin = redirectAfterApiLoginObject.data('protocol')+'//'+document.location.hostname+redirectAfterApiLogin;
                                            // <input type="hidden" value="http(s)://redirect-to-another-server.com/with/protocol" data-protocol="http(s)" />
                                            else if (redirectAfterApiLoginObject.data('protocol') && redirectAfterApiLogin.match(/^http/)) {
                                                // <input type="hidden" value="http://redirect-to-another-server.com/with/protocol" data-protocol="https" />
                                                if (redirectAfterApiLogin.match(/^https:/) && redirectAfterApiLoginObject.data('protocol') != 'https')
                                                    redirectAfterApiLogin = redirectAfterApiLogin.replace(/^https:/, 'http:');
                                                // <input type="hidden" value="https://redirect-to-another-server.com/with/protocol" data-protocol="http" />
                                                else if (redirectAfterApiLogin.match(/^http:/) && redirectAfterApiLoginObject.data('protocol') != 'http')
                                                    redirectAfterApiLogin = redirectAfterApiLogin.replace(/^http:/, 'https:');
                                            }
                                            // <input type="hidden" value="/redirect/onthis/server" />
                                            if (!redirectAfterApiLogin.match(/^http/))
                                                redirectAfterApiLogin = document.location.protocol+'//'+document.location.hostname+redirectAfterApiLogin;
                                            window.location.href = redirectAfterApiLogin;
                                        }
                                        else {
                                            location.reload();
                                        }
                                    }
                                }
                            }
                        });
                    });
                });
            }
        });

        function sfLoginForm($form, callback){
            var request = {"grant_type": "password",
                           "scope": "user"};
            $.each($form.serializeArray(), function(i, field) {
                request[field.name] = field.value;
            });
            request.client_id = settings.client_id;
            request.client_secret = settings.client_secret;
            $.ajax({
                type    : 'post',
                url     : settings.tokenURL,
                data    : request
            }).done(function (requestData) {
                if(typeof requestData.access_token != "undefined") {
                    $.ajax({
                        type    : 'post',
                        url     : settings.authURL+'?access_token='+requestData.access_token,
                        async   : false
                    }).done(function (data) {
                        jsoObj.getToken(function(data) {
                            callback(data);
                        }, requestData);
                    });
                } else {
                    if(typeof requestData.responseJSON != "undefined") {
                        if (typeof requestData.responseJSON.error_description != "undefined") 
                            window.console.log(requestData.responseJSON.error_description);
                    }
                    else
                        window.console.log("An unexpeded error occured xrjs0.");
                }
            }).fail(function (jqXHR) {
                if(typeof jqXHR.responseJSON != "undefined") {
                    if (typeof jqXHR.responseJSON.error_description != "undefined") 
                        window.console.log(jqXHR.responseJSON.error_description);
                }
                else
                    window.console.log("An unexpeded error occured: " + jqXHR.statusText + ", HTTP Code " + jqXHR.status + ":xrjs1.");
            });
        }
    });
} else {
    window.console.log("Please set oauth_client_id, oauth_client_secret in parameters.yml for xrowrest.js.");
}