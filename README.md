# cfproxy.js

[![npm version](https://badge.fury.io/js/%40twy-gmbh%2Fconditional-forward-proxy.svg)](https://badge.fury.io/js/%40twy-gmbh%2Fconditional-forward-proxy)

**\[WIP\]** It's a HTTP / HTTPS proxy which will be able be fed with rules, so that it can decide whether the request is sent
from the current machine, or sent to another proxy.

## Table of Contents

1.  [Documentation](#documentation)
    1.  [Installation](#installation)
    2.  [Usage](#usage)
2.  [License](#license)

## What is it?

**`cfproxy.js`** Conditionally either execute the request
on the current machine, or forward it to another HTTP / HTTPS proxy.

## [Documentation](#documentation)

<a name="documentation"></a>

### Installation

<a name="installation"></a>

```shell
npm install -g @twy-gmbh/conditional-forward-proxy
```

<a name="usage"></a>

### Usage

For testing:

```shell
cfproxy
```

For permanent use:
https://www.axllent.org/docs/view/nodejs-service-with-systemd/

Disclaimer: Please be advised this library is not (yet) tested. Do not use for production environments.

<a name="issues"></a>

Please do not hesitate to open an issue in case you are running into problems.

## License

<a name="license"></a>

Copyright (c) 2020 Reto Ryter (twitter: [@rryter](https://twitter.com/rryter))
Licensed under the MIT license.
