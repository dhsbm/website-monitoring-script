import err from './err'
import http from './http'
import per from './per'
import beh from './beh'
import { setWebId } from './util'
err()
http()
per()
beh()

export { setWebId }
