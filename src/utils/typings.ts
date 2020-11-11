import { getServiceName } from './config'

export const getInterfaceFileNamePrefix = () =>
(getServiceName() || 'index') + '.d'

export const createInterfaceName = (serviceName: string) => `I${serviceName}`
