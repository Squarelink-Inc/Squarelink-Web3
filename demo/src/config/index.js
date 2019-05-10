import dev from './dev'
import prod from './prod'

const ENV = process.env.NODE_ENV || 'development'

export default (ENV === 'development' ? dev : prod)
