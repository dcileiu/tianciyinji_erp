
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'CustomerForm': typeof import("../app/components/CustomerForm.vue")['default']
    'DynamicNavigation': typeof import("../app/components/DynamicNavigation.vue")['default']
    'Login': typeof import("../app/components/Login.vue")['default']
    'MenuForm': typeof import("../app/components/MenuForm.vue")['default']
    'MenuRow': typeof import("../app/components/MenuRow.vue")['default']
    'PermissionTree': typeof import("../app/components/PermissionTree.vue")['default']
    'PermissionTreeNode': typeof import("../app/components/PermissionTreeNode.vue")['default']
    'PermissionWrapper': typeof import("../app/components/PermissionWrapper.vue")['default']
    'Register': typeof import("../app/components/Register.vue")['default']
    'ResourceForm': typeof import("../app/components/ResourceForm.vue")['default']
    'RoleForm': typeof import("../app/components/RoleForm.vue")['default']
    'SupplierForm': typeof import("../app/components/SupplierForm.vue")['default']
    'ThemeToggle': typeof import("../app/components/ThemeToggle.vue")['default']
    'FormsForm': typeof import("../app/components/forms/Form.vue")['default']
    'FormsFormField': typeof import("../app/components/forms/FormField.vue")['default']
    'UiAvatar': typeof import("../app/components/ui/Avatar.vue")['default']
    'UiBadge': typeof import("../app/components/ui/Badge.vue")['default']
    'UiButton': typeof import("../app/components/ui/Button.vue")['default']
    'UiCard': typeof import("../app/components/ui/Card.vue")['default']
    'UiCheckbox': typeof import("../app/components/ui/Checkbox.vue")['default']
    'UiDialog': typeof import("../app/components/ui/Dialog.vue")['default']
    'UiErrorBoundary': typeof import("../app/components/ui/ErrorBoundary.vue")['default']
    'UiGlobalLoader': typeof import("../app/components/ui/GlobalLoader.vue")['default']
    'UiInput': typeof import("../app/components/ui/Input.vue")['default']
    'UiLabel': typeof import("../app/components/ui/Label.vue")['default']
    'UiProgress': typeof import("../app/components/ui/Progress.vue")['default']
    'UiSelect': typeof import("../app/components/ui/Select.vue")['default']
    'UiSeparator': typeof import("../app/components/ui/Separator.vue")['default']
    'UiSkeleton': typeof import("../app/components/ui/Skeleton.vue")['default']
    'UiSwitch': typeof import("../app/components/ui/Switch.vue")['default']
    'UiTable': typeof import("../app/components/ui/Table.vue")['default']
    'UiTableBody': typeof import("../app/components/ui/TableBody.vue")['default']
    'UiTableCell': typeof import("../app/components/ui/TableCell.vue")['default']
    'UiTableHead': typeof import("../app/components/ui/TableHead.vue")['default']
    'UiTableHeader': typeof import("../app/components/ui/TableHeader.vue")['default']
    'UiTableRow': typeof import("../app/components/ui/TableRow.vue")['default']
    'UiTextarea': typeof import("../app/components/ui/Textarea.vue")['default']
    'UiTooltip': typeof import("../app/components/ui/Tooltip.vue")['default']
    'UiAlert': typeof import("../app/components/ui/alert/Alert.vue")['default']
    'UiAlertDescription': typeof import("../app/components/ui/alert/AlertDescription.vue")['default']
    'UiAlertTitle': typeof import("../app/components/ui/alert/AlertTitle.vue")['default']
    'UiDropdownMenu': typeof import("../app/components/ui/dropdown-menu/DropdownMenu.vue")['default']
    'UiDropdownMenuContent': typeof import("../app/components/ui/dropdown-menu/DropdownMenuContent.vue")['default']
    'UiDropdownMenuItem': typeof import("../app/components/ui/dropdown-menu/DropdownMenuItem.vue")['default']
    'UiDropdownMenuTrigger': typeof import("../app/components/ui/dropdown-menu/DropdownMenuTrigger.vue")['default']
    'UiSheet': typeof import("../app/components/ui/sheet/Sheet.vue")['default']
    'UiTabs': typeof import("../app/components/ui/tabs/Tabs.vue")['default']
    'UiTabsContent': typeof import("../app/components/ui/tabs/TabsContent.vue")['default']
    'UiTabsList': typeof import("../app/components/ui/tabs/TabsList.vue")['default']
    'UiTabsTrigger': typeof import("../app/components/ui/tabs/TabsTrigger.vue")['default']
    'UiToast': typeof import("../app/components/ui/toast/Toast.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'NuxtPage': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']
      'LazyCustomerForm': LazyComponent<typeof import("../app/components/CustomerForm.vue")['default']>
    'LazyDynamicNavigation': LazyComponent<typeof import("../app/components/DynamicNavigation.vue")['default']>
    'LazyLogin': LazyComponent<typeof import("../app/components/Login.vue")['default']>
    'LazyMenuForm': LazyComponent<typeof import("../app/components/MenuForm.vue")['default']>
    'LazyMenuRow': LazyComponent<typeof import("../app/components/MenuRow.vue")['default']>
    'LazyPermissionTree': LazyComponent<typeof import("../app/components/PermissionTree.vue")['default']>
    'LazyPermissionTreeNode': LazyComponent<typeof import("../app/components/PermissionTreeNode.vue")['default']>
    'LazyPermissionWrapper': LazyComponent<typeof import("../app/components/PermissionWrapper.vue")['default']>
    'LazyRegister': LazyComponent<typeof import("../app/components/Register.vue")['default']>
    'LazyResourceForm': LazyComponent<typeof import("../app/components/ResourceForm.vue")['default']>
    'LazyRoleForm': LazyComponent<typeof import("../app/components/RoleForm.vue")['default']>
    'LazySupplierForm': LazyComponent<typeof import("../app/components/SupplierForm.vue")['default']>
    'LazyThemeToggle': LazyComponent<typeof import("../app/components/ThemeToggle.vue")['default']>
    'LazyFormsForm': LazyComponent<typeof import("../app/components/forms/Form.vue")['default']>
    'LazyFormsFormField': LazyComponent<typeof import("../app/components/forms/FormField.vue")['default']>
    'LazyUiAvatar': LazyComponent<typeof import("../app/components/ui/Avatar.vue")['default']>
    'LazyUiBadge': LazyComponent<typeof import("../app/components/ui/Badge.vue")['default']>
    'LazyUiButton': LazyComponent<typeof import("../app/components/ui/Button.vue")['default']>
    'LazyUiCard': LazyComponent<typeof import("../app/components/ui/Card.vue")['default']>
    'LazyUiCheckbox': LazyComponent<typeof import("../app/components/ui/Checkbox.vue")['default']>
    'LazyUiDialog': LazyComponent<typeof import("../app/components/ui/Dialog.vue")['default']>
    'LazyUiErrorBoundary': LazyComponent<typeof import("../app/components/ui/ErrorBoundary.vue")['default']>
    'LazyUiGlobalLoader': LazyComponent<typeof import("../app/components/ui/GlobalLoader.vue")['default']>
    'LazyUiInput': LazyComponent<typeof import("../app/components/ui/Input.vue")['default']>
    'LazyUiLabel': LazyComponent<typeof import("../app/components/ui/Label.vue")['default']>
    'LazyUiProgress': LazyComponent<typeof import("../app/components/ui/Progress.vue")['default']>
    'LazyUiSelect': LazyComponent<typeof import("../app/components/ui/Select.vue")['default']>
    'LazyUiSeparator': LazyComponent<typeof import("../app/components/ui/Separator.vue")['default']>
    'LazyUiSkeleton': LazyComponent<typeof import("../app/components/ui/Skeleton.vue")['default']>
    'LazyUiSwitch': LazyComponent<typeof import("../app/components/ui/Switch.vue")['default']>
    'LazyUiTable': LazyComponent<typeof import("../app/components/ui/Table.vue")['default']>
    'LazyUiTableBody': LazyComponent<typeof import("../app/components/ui/TableBody.vue")['default']>
    'LazyUiTableCell': LazyComponent<typeof import("../app/components/ui/TableCell.vue")['default']>
    'LazyUiTableHead': LazyComponent<typeof import("../app/components/ui/TableHead.vue")['default']>
    'LazyUiTableHeader': LazyComponent<typeof import("../app/components/ui/TableHeader.vue")['default']>
    'LazyUiTableRow': LazyComponent<typeof import("../app/components/ui/TableRow.vue")['default']>
    'LazyUiTextarea': LazyComponent<typeof import("../app/components/ui/Textarea.vue")['default']>
    'LazyUiTooltip': LazyComponent<typeof import("../app/components/ui/Tooltip.vue")['default']>
    'LazyUiAlert': LazyComponent<typeof import("../app/components/ui/alert/Alert.vue")['default']>
    'LazyUiAlertDescription': LazyComponent<typeof import("../app/components/ui/alert/AlertDescription.vue")['default']>
    'LazyUiAlertTitle': LazyComponent<typeof import("../app/components/ui/alert/AlertTitle.vue")['default']>
    'LazyUiDropdownMenu': LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenu.vue")['default']>
    'LazyUiDropdownMenuContent': LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenuContent.vue")['default']>
    'LazyUiDropdownMenuItem': LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenuItem.vue")['default']>
    'LazyUiDropdownMenuTrigger': LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenuTrigger.vue")['default']>
    'LazyUiSheet': LazyComponent<typeof import("../app/components/ui/sheet/Sheet.vue")['default']>
    'LazyUiTabs': LazyComponent<typeof import("../app/components/ui/tabs/Tabs.vue")['default']>
    'LazyUiTabsContent': LazyComponent<typeof import("../app/components/ui/tabs/TabsContent.vue")['default']>
    'LazyUiTabsList': LazyComponent<typeof import("../app/components/ui/tabs/TabsList.vue")['default']>
    'LazyUiTabsTrigger': LazyComponent<typeof import("../app/components/ui/tabs/TabsTrigger.vue")['default']>
    'LazyUiToast': LazyComponent<typeof import("../app/components/ui/toast/Toast.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const CustomerForm: typeof import("../app/components/CustomerForm.vue")['default']
export const DynamicNavigation: typeof import("../app/components/DynamicNavigation.vue")['default']
export const Login: typeof import("../app/components/Login.vue")['default']
export const MenuForm: typeof import("../app/components/MenuForm.vue")['default']
export const MenuRow: typeof import("../app/components/MenuRow.vue")['default']
export const PermissionTree: typeof import("../app/components/PermissionTree.vue")['default']
export const PermissionTreeNode: typeof import("../app/components/PermissionTreeNode.vue")['default']
export const PermissionWrapper: typeof import("../app/components/PermissionWrapper.vue")['default']
export const Register: typeof import("../app/components/Register.vue")['default']
export const ResourceForm: typeof import("../app/components/ResourceForm.vue")['default']
export const RoleForm: typeof import("../app/components/RoleForm.vue")['default']
export const SupplierForm: typeof import("../app/components/SupplierForm.vue")['default']
export const ThemeToggle: typeof import("../app/components/ThemeToggle.vue")['default']
export const FormsForm: typeof import("../app/components/forms/Form.vue")['default']
export const FormsFormField: typeof import("../app/components/forms/FormField.vue")['default']
export const UiAvatar: typeof import("../app/components/ui/Avatar.vue")['default']
export const UiBadge: typeof import("../app/components/ui/Badge.vue")['default']
export const UiButton: typeof import("../app/components/ui/Button.vue")['default']
export const UiCard: typeof import("../app/components/ui/Card.vue")['default']
export const UiCheckbox: typeof import("../app/components/ui/Checkbox.vue")['default']
export const UiDialog: typeof import("../app/components/ui/Dialog.vue")['default']
export const UiErrorBoundary: typeof import("../app/components/ui/ErrorBoundary.vue")['default']
export const UiGlobalLoader: typeof import("../app/components/ui/GlobalLoader.vue")['default']
export const UiInput: typeof import("../app/components/ui/Input.vue")['default']
export const UiLabel: typeof import("../app/components/ui/Label.vue")['default']
export const UiProgress: typeof import("../app/components/ui/Progress.vue")['default']
export const UiSelect: typeof import("../app/components/ui/Select.vue")['default']
export const UiSeparator: typeof import("../app/components/ui/Separator.vue")['default']
export const UiSkeleton: typeof import("../app/components/ui/Skeleton.vue")['default']
export const UiSwitch: typeof import("../app/components/ui/Switch.vue")['default']
export const UiTable: typeof import("../app/components/ui/Table.vue")['default']
export const UiTableBody: typeof import("../app/components/ui/TableBody.vue")['default']
export const UiTableCell: typeof import("../app/components/ui/TableCell.vue")['default']
export const UiTableHead: typeof import("../app/components/ui/TableHead.vue")['default']
export const UiTableHeader: typeof import("../app/components/ui/TableHeader.vue")['default']
export const UiTableRow: typeof import("../app/components/ui/TableRow.vue")['default']
export const UiTextarea: typeof import("../app/components/ui/Textarea.vue")['default']
export const UiTooltip: typeof import("../app/components/ui/Tooltip.vue")['default']
export const UiAlert: typeof import("../app/components/ui/alert/Alert.vue")['default']
export const UiAlertDescription: typeof import("../app/components/ui/alert/AlertDescription.vue")['default']
export const UiAlertTitle: typeof import("../app/components/ui/alert/AlertTitle.vue")['default']
export const UiDropdownMenu: typeof import("../app/components/ui/dropdown-menu/DropdownMenu.vue")['default']
export const UiDropdownMenuContent: typeof import("../app/components/ui/dropdown-menu/DropdownMenuContent.vue")['default']
export const UiDropdownMenuItem: typeof import("../app/components/ui/dropdown-menu/DropdownMenuItem.vue")['default']
export const UiDropdownMenuTrigger: typeof import("../app/components/ui/dropdown-menu/DropdownMenuTrigger.vue")['default']
export const UiSheet: typeof import("../app/components/ui/sheet/Sheet.vue")['default']
export const UiTabs: typeof import("../app/components/ui/tabs/Tabs.vue")['default']
export const UiTabsContent: typeof import("../app/components/ui/tabs/TabsContent.vue")['default']
export const UiTabsList: typeof import("../app/components/ui/tabs/TabsList.vue")['default']
export const UiTabsTrigger: typeof import("../app/components/ui/tabs/TabsTrigger.vue")['default']
export const UiToast: typeof import("../app/components/ui/toast/Toast.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const LazyCustomerForm: LazyComponent<typeof import("../app/components/CustomerForm.vue")['default']>
export const LazyDynamicNavigation: LazyComponent<typeof import("../app/components/DynamicNavigation.vue")['default']>
export const LazyLogin: LazyComponent<typeof import("../app/components/Login.vue")['default']>
export const LazyMenuForm: LazyComponent<typeof import("../app/components/MenuForm.vue")['default']>
export const LazyMenuRow: LazyComponent<typeof import("../app/components/MenuRow.vue")['default']>
export const LazyPermissionTree: LazyComponent<typeof import("../app/components/PermissionTree.vue")['default']>
export const LazyPermissionTreeNode: LazyComponent<typeof import("../app/components/PermissionTreeNode.vue")['default']>
export const LazyPermissionWrapper: LazyComponent<typeof import("../app/components/PermissionWrapper.vue")['default']>
export const LazyRegister: LazyComponent<typeof import("../app/components/Register.vue")['default']>
export const LazyResourceForm: LazyComponent<typeof import("../app/components/ResourceForm.vue")['default']>
export const LazyRoleForm: LazyComponent<typeof import("../app/components/RoleForm.vue")['default']>
export const LazySupplierForm: LazyComponent<typeof import("../app/components/SupplierForm.vue")['default']>
export const LazyThemeToggle: LazyComponent<typeof import("../app/components/ThemeToggle.vue")['default']>
export const LazyFormsForm: LazyComponent<typeof import("../app/components/forms/Form.vue")['default']>
export const LazyFormsFormField: LazyComponent<typeof import("../app/components/forms/FormField.vue")['default']>
export const LazyUiAvatar: LazyComponent<typeof import("../app/components/ui/Avatar.vue")['default']>
export const LazyUiBadge: LazyComponent<typeof import("../app/components/ui/Badge.vue")['default']>
export const LazyUiButton: LazyComponent<typeof import("../app/components/ui/Button.vue")['default']>
export const LazyUiCard: LazyComponent<typeof import("../app/components/ui/Card.vue")['default']>
export const LazyUiCheckbox: LazyComponent<typeof import("../app/components/ui/Checkbox.vue")['default']>
export const LazyUiDialog: LazyComponent<typeof import("../app/components/ui/Dialog.vue")['default']>
export const LazyUiErrorBoundary: LazyComponent<typeof import("../app/components/ui/ErrorBoundary.vue")['default']>
export const LazyUiGlobalLoader: LazyComponent<typeof import("../app/components/ui/GlobalLoader.vue")['default']>
export const LazyUiInput: LazyComponent<typeof import("../app/components/ui/Input.vue")['default']>
export const LazyUiLabel: LazyComponent<typeof import("../app/components/ui/Label.vue")['default']>
export const LazyUiProgress: LazyComponent<typeof import("../app/components/ui/Progress.vue")['default']>
export const LazyUiSelect: LazyComponent<typeof import("../app/components/ui/Select.vue")['default']>
export const LazyUiSeparator: LazyComponent<typeof import("../app/components/ui/Separator.vue")['default']>
export const LazyUiSkeleton: LazyComponent<typeof import("../app/components/ui/Skeleton.vue")['default']>
export const LazyUiSwitch: LazyComponent<typeof import("../app/components/ui/Switch.vue")['default']>
export const LazyUiTable: LazyComponent<typeof import("../app/components/ui/Table.vue")['default']>
export const LazyUiTableBody: LazyComponent<typeof import("../app/components/ui/TableBody.vue")['default']>
export const LazyUiTableCell: LazyComponent<typeof import("../app/components/ui/TableCell.vue")['default']>
export const LazyUiTableHead: LazyComponent<typeof import("../app/components/ui/TableHead.vue")['default']>
export const LazyUiTableHeader: LazyComponent<typeof import("../app/components/ui/TableHeader.vue")['default']>
export const LazyUiTableRow: LazyComponent<typeof import("../app/components/ui/TableRow.vue")['default']>
export const LazyUiTextarea: LazyComponent<typeof import("../app/components/ui/Textarea.vue")['default']>
export const LazyUiTooltip: LazyComponent<typeof import("../app/components/ui/Tooltip.vue")['default']>
export const LazyUiAlert: LazyComponent<typeof import("../app/components/ui/alert/Alert.vue")['default']>
export const LazyUiAlertDescription: LazyComponent<typeof import("../app/components/ui/alert/AlertDescription.vue")['default']>
export const LazyUiAlertTitle: LazyComponent<typeof import("../app/components/ui/alert/AlertTitle.vue")['default']>
export const LazyUiDropdownMenu: LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenu.vue")['default']>
export const LazyUiDropdownMenuContent: LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenuContent.vue")['default']>
export const LazyUiDropdownMenuItem: LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenuItem.vue")['default']>
export const LazyUiDropdownMenuTrigger: LazyComponent<typeof import("../app/components/ui/dropdown-menu/DropdownMenuTrigger.vue")['default']>
export const LazyUiSheet: LazyComponent<typeof import("../app/components/ui/sheet/Sheet.vue")['default']>
export const LazyUiTabs: LazyComponent<typeof import("../app/components/ui/tabs/Tabs.vue")['default']>
export const LazyUiTabsContent: LazyComponent<typeof import("../app/components/ui/tabs/TabsContent.vue")['default']>
export const LazyUiTabsList: LazyComponent<typeof import("../app/components/ui/tabs/TabsList.vue")['default']>
export const LazyUiTabsTrigger: LazyComponent<typeof import("../app/components/ui/tabs/TabsTrigger.vue")['default']>
export const LazyUiToast: LazyComponent<typeof import("../app/components/ui/toast/Toast.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_91bee25a2dcd7b3e544a45cdb9d9cf74/node_modules/nuxt/dist/app/components/server-placeholder")['default']>

export const componentNames: string[]
