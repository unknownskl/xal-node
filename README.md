# xal-node

**xal-node:** Typescript implementation for Xbox Authentication Library (XAL)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=unknownskl_xal-node&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=unknownskl_xal-node)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=unknownskl_xal-node&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=unknownskl_xal-node)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=unknownskl_xal-node&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=unknownskl_xal-node)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=unknownskl_xal-node&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=unknownskl_xal-node)


📚 Documentation: [https://unknownskl.github.io/xal-node/](https://unknownskl.github.io/xal-node/)


## Other AppId and titleId's

It is possible to authenticate to different services using this library as well. Not all calls are supported but the authentication part is quite general. 
You can override the titleId like below:

    const xal = xallib.Xal()
    xal._app = {
        AppId: '<appId>',
        TitleId: '<titleId>',
        RedirectUri: '<redirectUri>',
    }

## Credits

Big thanks to [@tuxuser](https://github.com/tuxuser) and [Team OpenXbox](https://github.com/OpenXbox) for creating the xal-rs library and giving the inspiration to port this over to Typescript