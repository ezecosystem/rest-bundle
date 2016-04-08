import {provide} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
import {FORM_PROVIDERS} from "angular2/common";
import {ROUTER_PROVIDERS} from "angular2/router";
import {Http, HTTP_PROVIDERS} from "angular2/http";
import {AuthConfig, AuthHttp} from "angular2-jwt";

import {AppComponent} from "app/app.component";
#import {AppComponent} from "../app/app.component";

bootstrap(
    AppComponent, [
        FORM_PROVIDERS,
        ROUTER_PROVIDERS,
        HTTP_PROVIDERS,
        provide(AuthHttp, {
            useFactory: (http) => {
                return new AuthHttp(new AuthConfig({
                    tokenName: "jwt"
                }), http);
            },
            deps: [Http]
        })
    ]
);