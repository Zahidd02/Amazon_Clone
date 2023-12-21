import * as process from 'process';

var global: any = global || window;
window['process'] = process;
global.Buffer = global.Buffer || require('buffer').Buffer;
