import { version } from "@fakeit/core";

import {h, renderToString} from 'ink';

const Version = () => version;

process.stdout.write(renderToString(<Version/>));
