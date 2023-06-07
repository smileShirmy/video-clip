export enum ResourceComponentName {
  LOCAL_RESOURCE = 'localResource',
  TEXT_RESOURCE = 'textResource'
}

export interface MenuItem {
  componentName: ResourceComponentName
  name: string
}
