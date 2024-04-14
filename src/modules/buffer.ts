import "core-js/full/typed-array/uint8-array";
import "core-js/full/function/is-callable";
import "core-js/full/object/set-prototype-of";
import "core-js/full/function/bind"
import 'core-js/full/array'
import {Buffer} from "buffer";
global.Buffer = Buffer;
export {Buffer}