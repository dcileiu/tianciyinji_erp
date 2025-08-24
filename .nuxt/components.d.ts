
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
      'AppSideBar': typeof import("../app/components/AppSideBar.vue")['default']
    'GlobalLoader': typeof import("../app/components/GlobalLoader.vue")['default']
    'NavMain': typeof import("../app/components/NavMain.vue")['default']
    'NavUser': typeof import("../app/components/NavUser.vue")['default']
    'PermissionTree': typeof import("../app/components/PermissionTree.vue")['default']
    'PermissionTreeNode': typeof import("../app/components/PermissionTreeNode.vue")['default']
    'PermissionWrapper': typeof import("../app/components/PermissionWrapper.vue")['default']
    'Register': typeof import("../app/components/Register.vue")['default']
    'SidebarMenu': typeof import("../app/components/ui/sidebar/index")['SidebarMenu']
    'NuxtWelcome': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'Accordion': typeof import("../app/components/ui/accordion/index")['Accordion']
    'AccordionContent': typeof import("../app/components/ui/accordion/index")['AccordionContent']
    'AccordionItem': typeof import("../app/components/ui/accordion/index")['AccordionItem']
    'AccordionTrigger': typeof import("../app/components/ui/accordion/index")['AccordionTrigger']
    'Alert': typeof import("../app/components/ui/alert/index")['Alert']
    'AlertDescription': typeof import("../app/components/ui/alert/index")['AlertDescription']
    'AlertTitle': typeof import("../app/components/ui/alert/index")['AlertTitle']
    'AlertDialog': typeof import("../app/components/ui/alert-dialog/index")['AlertDialog']
    'AlertDialogAction': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogAction']
    'AlertDialogCancel': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogCancel']
    'AlertDialogContent': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogContent']
    'AlertDialogDescription': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogDescription']
    'AlertDialogFooter': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogFooter']
    'AlertDialogHeader': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogHeader']
    'AlertDialogTitle': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTitle']
    'AlertDialogTrigger': typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTrigger']
    'AspectRatio': typeof import("../app/components/ui/aspect-ratio/index")['AspectRatio']
    'AutoForm': typeof import("../app/components/ui/auto-form/index")['AutoForm']
    'AutoFormField': typeof import("../app/components/ui/auto-form/index")['AutoFormField']
    'AutoFormFieldArray': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldArray']
    'AutoFormFieldBoolean': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldBoolean']
    'AutoFormFieldDate': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldDate']
    'AutoFormFieldEnum': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldEnum']
    'AutoFormFieldFile': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldFile']
    'AutoFormFieldInput': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldInput']
    'AutoFormFieldNumber': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldNumber']
    'AutoFormFieldObject': typeof import("../app/components/ui/auto-form/index")['AutoFormFieldObject']
    'AutoFormLabel': typeof import("../app/components/ui/auto-form/index")['AutoFormLabel']
    'Config': typeof import("../app/components/ui/auto-form/index")['Config']
    'ConfigItem': typeof import("../app/components/ui/auto-form/index")['ConfigItem']
    'FieldProps': typeof import("../app/components/ui/auto-form/index")['FieldProps']
    'Avatar': typeof import("../app/components/ui/avatar/index")['Avatar']
    'AvatarFallback': typeof import("../app/components/ui/avatar/index")['AvatarFallback']
    'AvatarImage': typeof import("../app/components/ui/avatar/index")['AvatarImage']
    'Breadcrumb': typeof import("../app/components/ui/breadcrumb/index")['Breadcrumb']
    'BreadcrumbEllipsis': typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbEllipsis']
    'BreadcrumbItem': typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbItem']
    'BreadcrumbLink': typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbLink']
    'BreadcrumbList': typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbList']
    'BreadcrumbPage': typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbPage']
    'BreadcrumbSeparator': typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbSeparator']
    'Button': typeof import("../app/components/ui/button/index")['Button']
    'Badge': typeof import("../app/components/ui/badge/index")['Badge']
    'Calendar': typeof import("../app/components/ui/calendar/index")['Calendar']
    'CalendarCell': typeof import("../app/components/ui/calendar/index")['CalendarCell']
    'CalendarCellTrigger': typeof import("../app/components/ui/calendar/index")['CalendarCellTrigger']
    'CalendarGrid': typeof import("../app/components/ui/calendar/index")['CalendarGrid']
    'CalendarGridBody': typeof import("../app/components/ui/calendar/index")['CalendarGridBody']
    'CalendarGridHead': typeof import("../app/components/ui/calendar/index")['CalendarGridHead']
    'CalendarGridRow': typeof import("../app/components/ui/calendar/index")['CalendarGridRow']
    'CalendarHeadCell': typeof import("../app/components/ui/calendar/index")['CalendarHeadCell']
    'CalendarHeader': typeof import("../app/components/ui/calendar/index")['CalendarHeader']
    'CalendarHeading': typeof import("../app/components/ui/calendar/index")['CalendarHeading']
    'CalendarNextButton': typeof import("../app/components/ui/calendar/index")['CalendarNextButton']
    'CalendarPrevButton': typeof import("../app/components/ui/calendar/index")['CalendarPrevButton']
    'Card': typeof import("../app/components/ui/card/index")['Card']
    'CardAction': typeof import("../app/components/ui/card/index")['CardAction']
    'CardContent': typeof import("../app/components/ui/card/index")['CardContent']
    'CardDescription': typeof import("../app/components/ui/card/index")['CardDescription']
    'CardFooter': typeof import("../app/components/ui/card/index")['CardFooter']
    'CardHeader': typeof import("../app/components/ui/card/index")['CardHeader']
    'CardTitle': typeof import("../app/components/ui/card/index")['CardTitle']
    'Carousel': typeof import("../app/components/ui/carousel/index")['Carousel']
    'CarouselContent': typeof import("../app/components/ui/carousel/index")['CarouselContent']
    'CarouselItem': typeof import("../app/components/ui/carousel/index")['CarouselItem']
    'CarouselNext': typeof import("../app/components/ui/carousel/index")['CarouselNext']
    'CarouselPrevious': typeof import("../app/components/ui/carousel/index")['CarouselPrevious']
    'CarouselApi': typeof import("../app/components/ui/carousel/index")['CarouselApi']
    'ChartCrosshair': typeof import("../app/components/ui/chart/index")['ChartCrosshair']
    'ChartLegend': typeof import("../app/components/ui/chart/index")['ChartLegend']
    'ChartSingleTooltip': typeof import("../app/components/ui/chart/index")['ChartSingleTooltip']
    'ChartTooltip': typeof import("../app/components/ui/chart/index")['ChartTooltip']
    'AreaChart': typeof import("../app/components/ui/chart-area/index")['AreaChart']
    'BarChart': typeof import("../app/components/ui/chart-bar/index")['BarChart']
    'DonutChart': typeof import("../app/components/ui/chart-donut/index")['DonutChart']
    'LineChart': typeof import("../app/components/ui/chart-line/index")['LineChart']
    'Checkbox': typeof import("../app/components/ui/checkbox/index")['Checkbox']
    'Combobox': typeof import("../app/components/ui/combobox/index")['Combobox']
    'ComboboxAnchor': typeof import("../app/components/ui/combobox/index")['ComboboxAnchor']
    'ComboboxEmpty': typeof import("../app/components/ui/combobox/index")['ComboboxEmpty']
    'ComboboxGroup': typeof import("../app/components/ui/combobox/index")['ComboboxGroup']
    'ComboboxInput': typeof import("../app/components/ui/combobox/index")['ComboboxInput']
    'ComboboxItem': typeof import("../app/components/ui/combobox/index")['ComboboxItem']
    'ComboboxItemIndicator': typeof import("../app/components/ui/combobox/index")['ComboboxItemIndicator']
    'ComboboxList': typeof import("../app/components/ui/combobox/index")['ComboboxList']
    'ComboboxSeparator': typeof import("../app/components/ui/combobox/index")['ComboboxSeparator']
    'ComboboxViewport': typeof import("../app/components/ui/combobox/index")['ComboboxViewport']
    'ComboboxCancel': typeof import("../app/components/ui/combobox/index")['ComboboxCancel']
    'ComboboxTrigger': typeof import("../app/components/ui/combobox/index")['ComboboxTrigger']
    'Collapsible': typeof import("../app/components/ui/collapsible/index")['Collapsible']
    'CollapsibleContent': typeof import("../app/components/ui/collapsible/index")['CollapsibleContent']
    'CollapsibleTrigger': typeof import("../app/components/ui/collapsible/index")['CollapsibleTrigger']
    'Command': typeof import("../app/components/ui/command/index")['Command']
    'CommandDialog': typeof import("../app/components/ui/command/index")['CommandDialog']
    'CommandEmpty': typeof import("../app/components/ui/command/index")['CommandEmpty']
    'CommandGroup': typeof import("../app/components/ui/command/index")['CommandGroup']
    'CommandInput': typeof import("../app/components/ui/command/index")['CommandInput']
    'CommandItem': typeof import("../app/components/ui/command/index")['CommandItem']
    'CommandList': typeof import("../app/components/ui/command/index")['CommandList']
    'CommandSeparator': typeof import("../app/components/ui/command/index")['CommandSeparator']
    'CommandShortcut': typeof import("../app/components/ui/command/index")['CommandShortcut']
    'ContextMenu': typeof import("../app/components/ui/context-menu/index")['ContextMenu']
    'ContextMenuCheckboxItem': typeof import("../app/components/ui/context-menu/index")['ContextMenuCheckboxItem']
    'ContextMenuContent': typeof import("../app/components/ui/context-menu/index")['ContextMenuContent']
    'ContextMenuGroup': typeof import("../app/components/ui/context-menu/index")['ContextMenuGroup']
    'ContextMenuItem': typeof import("../app/components/ui/context-menu/index")['ContextMenuItem']
    'ContextMenuLabel': typeof import("../app/components/ui/context-menu/index")['ContextMenuLabel']
    'ContextMenuRadioGroup': typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioGroup']
    'ContextMenuRadioItem': typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioItem']
    'ContextMenuSeparator': typeof import("../app/components/ui/context-menu/index")['ContextMenuSeparator']
    'ContextMenuShortcut': typeof import("../app/components/ui/context-menu/index")['ContextMenuShortcut']
    'ContextMenuSub': typeof import("../app/components/ui/context-menu/index")['ContextMenuSub']
    'ContextMenuSubContent': typeof import("../app/components/ui/context-menu/index")['ContextMenuSubContent']
    'ContextMenuSubTrigger': typeof import("../app/components/ui/context-menu/index")['ContextMenuSubTrigger']
    'ContextMenuTrigger': typeof import("../app/components/ui/context-menu/index")['ContextMenuTrigger']
    'Drawer': typeof import("../app/components/ui/drawer/index")['Drawer']
    'DrawerClose': typeof import("../app/components/ui/drawer/index")['DrawerClose']
    'DrawerContent': typeof import("../app/components/ui/drawer/index")['DrawerContent']
    'DrawerDescription': typeof import("../app/components/ui/drawer/index")['DrawerDescription']
    'DrawerFooter': typeof import("../app/components/ui/drawer/index")['DrawerFooter']
    'DrawerHeader': typeof import("../app/components/ui/drawer/index")['DrawerHeader']
    'DrawerOverlay': typeof import("../app/components/ui/drawer/index")['DrawerOverlay']
    'DrawerTitle': typeof import("../app/components/ui/drawer/index")['DrawerTitle']
    'DrawerTrigger': typeof import("../app/components/ui/drawer/index")['DrawerTrigger']
    'Dialog': typeof import("../app/components/ui/dialog/index")['Dialog']
    'DialogClose': typeof import("../app/components/ui/dialog/index")['DialogClose']
    'DialogContent': typeof import("../app/components/ui/dialog/index")['DialogContent']
    'DialogDescription': typeof import("../app/components/ui/dialog/index")['DialogDescription']
    'DialogFooter': typeof import("../app/components/ui/dialog/index")['DialogFooter']
    'DialogHeader': typeof import("../app/components/ui/dialog/index")['DialogHeader']
    'DialogOverlay': typeof import("../app/components/ui/dialog/index")['DialogOverlay']
    'DialogScrollContent': typeof import("../app/components/ui/dialog/index")['DialogScrollContent']
    'DialogTitle': typeof import("../app/components/ui/dialog/index")['DialogTitle']
    'DialogTrigger': typeof import("../app/components/ui/dialog/index")['DialogTrigger']
    'FormControl': typeof import("../app/components/ui/form/index")['FormControl']
    'FormDescription': typeof import("../app/components/ui/form/index")['FormDescription']
    'FormItem': typeof import("../app/components/ui/form/index")['FormItem']
    'FormLabel': typeof import("../app/components/ui/form/index")['FormLabel']
    'FormMessage': typeof import("../app/components/ui/form/index")['FormMessage']
    'FORMITEMINJECTIONKEY': typeof import("../app/components/ui/form/index")['FORM_ITEM_INJECTION_KEY']
    'Form': typeof import("../app/components/ui/form/index")['Form']
    'FormField': typeof import("../app/components/ui/form/index")['FormField']
    'FormFieldArray': typeof import("../app/components/ui/form/index")['FormFieldArray']
    'DropdownMenu': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenu']
    'DropdownMenuCheckboxItem': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuCheckboxItem']
    'DropdownMenuContent': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuContent']
    'DropdownMenuGroup': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuGroup']
    'DropdownMenuItem': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuItem']
    'DropdownMenuLabel': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuLabel']
    'DropdownMenuRadioGroup': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioGroup']
    'DropdownMenuRadioItem': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioItem']
    'DropdownMenuSeparator': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSeparator']
    'DropdownMenuShortcut': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuShortcut']
    'DropdownMenuSub': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSub']
    'DropdownMenuSubContent': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubContent']
    'DropdownMenuSubTrigger': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubTrigger']
    'DropdownMenuTrigger': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuTrigger']
    'DropdownMenuPortal': typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuPortal']
    'HoverCard': typeof import("../app/components/ui/hover-card/index")['HoverCard']
    'HoverCardContent': typeof import("../app/components/ui/hover-card/index")['HoverCardContent']
    'HoverCardTrigger': typeof import("../app/components/ui/hover-card/index")['HoverCardTrigger']
    'Input': typeof import("../app/components/ui/input/index")['Input']
    'Label': typeof import("../app/components/ui/label/index")['Label']
    'Menubar': typeof import("../app/components/ui/menubar/index")['Menubar']
    'MenubarCheckboxItem': typeof import("../app/components/ui/menubar/index")['MenubarCheckboxItem']
    'MenubarContent': typeof import("../app/components/ui/menubar/index")['MenubarContent']
    'MenubarGroup': typeof import("../app/components/ui/menubar/index")['MenubarGroup']
    'MenubarItem': typeof import("../app/components/ui/menubar/index")['MenubarItem']
    'MenubarLabel': typeof import("../app/components/ui/menubar/index")['MenubarLabel']
    'MenubarMenu': typeof import("../app/components/ui/menubar/index")['MenubarMenu']
    'MenubarRadioGroup': typeof import("../app/components/ui/menubar/index")['MenubarRadioGroup']
    'MenubarRadioItem': typeof import("../app/components/ui/menubar/index")['MenubarRadioItem']
    'MenubarSeparator': typeof import("../app/components/ui/menubar/index")['MenubarSeparator']
    'MenubarShortcut': typeof import("../app/components/ui/menubar/index")['MenubarShortcut']
    'MenubarSub': typeof import("../app/components/ui/menubar/index")['MenubarSub']
    'MenubarSubContent': typeof import("../app/components/ui/menubar/index")['MenubarSubContent']
    'MenubarSubTrigger': typeof import("../app/components/ui/menubar/index")['MenubarSubTrigger']
    'MenubarTrigger': typeof import("../app/components/ui/menubar/index")['MenubarTrigger']
    'NavigationMenu': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenu']
    'NavigationMenuContent': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuContent']
    'NavigationMenuIndicator': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuIndicator']
    'NavigationMenuItem': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuItem']
    'NavigationMenuLink': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuLink']
    'NavigationMenuList': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuList']
    'NavigationMenuTrigger': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuTrigger']
    'NavigationMenuViewport': typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuViewport']
    'NumberField': typeof import("../app/components/ui/number-field/index")['NumberField']
    'NumberFieldContent': typeof import("../app/components/ui/number-field/index")['NumberFieldContent']
    'NumberFieldDecrement': typeof import("../app/components/ui/number-field/index")['NumberFieldDecrement']
    'NumberFieldIncrement': typeof import("../app/components/ui/number-field/index")['NumberFieldIncrement']
    'NumberFieldInput': typeof import("../app/components/ui/number-field/index")['NumberFieldInput']
    'Pagination': typeof import("../app/components/ui/pagination/index")['Pagination']
    'PaginationContent': typeof import("../app/components/ui/pagination/index")['PaginationContent']
    'PaginationEllipsis': typeof import("../app/components/ui/pagination/index")['PaginationEllipsis']
    'PaginationFirst': typeof import("../app/components/ui/pagination/index")['PaginationFirst']
    'PaginationItem': typeof import("../app/components/ui/pagination/index")['PaginationItem']
    'PaginationLast': typeof import("../app/components/ui/pagination/index")['PaginationLast']
    'PaginationNext': typeof import("../app/components/ui/pagination/index")['PaginationNext']
    'PaginationPrevious': typeof import("../app/components/ui/pagination/index")['PaginationPrevious']
    'PinInput': typeof import("../app/components/ui/pin-input/index")['PinInput']
    'PinInputGroup': typeof import("../app/components/ui/pin-input/index")['PinInputGroup']
    'PinInputSeparator': typeof import("../app/components/ui/pin-input/index")['PinInputSeparator']
    'PinInputSlot': typeof import("../app/components/ui/pin-input/index")['PinInputSlot']
    'Popover': typeof import("../app/components/ui/popover/index")['Popover']
    'PopoverAnchor': typeof import("../app/components/ui/popover/index")['PopoverAnchor']
    'PopoverContent': typeof import("../app/components/ui/popover/index")['PopoverContent']
    'PopoverTrigger': typeof import("../app/components/ui/popover/index")['PopoverTrigger']
    'Progress': typeof import("../app/components/ui/progress/index")['Progress']
    'RadioGroup': typeof import("../app/components/ui/radio-group/index")['RadioGroup']
    'RadioGroupItem': typeof import("../app/components/ui/radio-group/index")['RadioGroupItem']
    'RangeCalendar': typeof import("../app/components/ui/range-calendar/index")['RangeCalendar']
    'RangeCalendarCell': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCell']
    'RangeCalendarCellTrigger': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCellTrigger']
    'RangeCalendarGrid': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGrid']
    'RangeCalendarGridBody': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridBody']
    'RangeCalendarGridHead': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridHead']
    'RangeCalendarGridRow': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridRow']
    'RangeCalendarHeadCell': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeadCell']
    'RangeCalendarHeader': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeader']
    'RangeCalendarHeading': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeading']
    'RangeCalendarNextButton': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarNextButton']
    'RangeCalendarPrevButton': typeof import("../app/components/ui/range-calendar/index")['RangeCalendarPrevButton']
    'ResizableHandle': typeof import("../app/components/ui/resizable/index")['ResizableHandle']
    'ResizablePanel': typeof import("../app/components/ui/resizable/index")['ResizablePanel']
    'ResizablePanelGroup': typeof import("../app/components/ui/resizable/index")['ResizablePanelGroup']
    'ScrollArea': typeof import("../app/components/ui/scroll-area/index")['ScrollArea']
    'ScrollBar': typeof import("../app/components/ui/scroll-area/index")['ScrollBar']
    'Select': typeof import("../app/components/ui/select/index")['Select']
    'SelectContent': typeof import("../app/components/ui/select/index")['SelectContent']
    'SelectGroup': typeof import("../app/components/ui/select/index")['SelectGroup']
    'SelectItem': typeof import("../app/components/ui/select/index")['SelectItem']
    'SelectItemText': typeof import("../app/components/ui/select/index")['SelectItemText']
    'SelectLabel': typeof import("../app/components/ui/select/index")['SelectLabel']
    'SelectScrollDownButton': typeof import("../app/components/ui/select/index")['SelectScrollDownButton']
    'SelectScrollUpButton': typeof import("../app/components/ui/select/index")['SelectScrollUpButton']
    'SelectSeparator': typeof import("../app/components/ui/select/index")['SelectSeparator']
    'SelectTrigger': typeof import("../app/components/ui/select/index")['SelectTrigger']
    'SelectValue': typeof import("../app/components/ui/select/index")['SelectValue']
    'Separator': typeof import("../app/components/ui/separator/index")['Separator']
    'Sheet': typeof import("../app/components/ui/sheet/index")['Sheet']
    'SheetClose': typeof import("../app/components/ui/sheet/index")['SheetClose']
    'SheetContent': typeof import("../app/components/ui/sheet/index")['SheetContent']
    'SheetDescription': typeof import("../app/components/ui/sheet/index")['SheetDescription']
    'SheetFooter': typeof import("../app/components/ui/sheet/index")['SheetFooter']
    'SheetHeader': typeof import("../app/components/ui/sheet/index")['SheetHeader']
    'SheetTitle': typeof import("../app/components/ui/sheet/index")['SheetTitle']
    'SheetTrigger': typeof import("../app/components/ui/sheet/index")['SheetTrigger']
    'Sidebar': typeof import("../app/components/ui/sidebar/index")['Sidebar']
    'SidebarContent': typeof import("../app/components/ui/sidebar/index")['SidebarContent']
    'SidebarFooter': typeof import("../app/components/ui/sidebar/index")['SidebarFooter']
    'SidebarGroup': typeof import("../app/components/ui/sidebar/index")['SidebarGroup']
    'SidebarGroupAction': typeof import("../app/components/ui/sidebar/index")['SidebarGroupAction']
    'SidebarGroupContent': typeof import("../app/components/ui/sidebar/index")['SidebarGroupContent']
    'SidebarGroupLabel': typeof import("../app/components/ui/sidebar/index")['SidebarGroupLabel']
    'SidebarHeader': typeof import("../app/components/ui/sidebar/index")['SidebarHeader']
    'SidebarInput': typeof import("../app/components/ui/sidebar/index")['SidebarInput']
    'SidebarInset': typeof import("../app/components/ui/sidebar/index")['SidebarInset']
    'SidebarMenuAction': typeof import("../app/components/ui/sidebar/index")['SidebarMenuAction']
    'SidebarMenuBadge': typeof import("../app/components/ui/sidebar/index")['SidebarMenuBadge']
    'SidebarMenuButton': typeof import("../app/components/ui/sidebar/index")['SidebarMenuButton']
    'SidebarMenuItem': typeof import("../app/components/ui/sidebar/index")['SidebarMenuItem']
    'SidebarMenuSkeleton': typeof import("../app/components/ui/sidebar/index")['SidebarMenuSkeleton']
    'SidebarMenuSub': typeof import("../app/components/ui/sidebar/index")['SidebarMenuSub']
    'SidebarMenuSubButton': typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubButton']
    'SidebarMenuSubItem': typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubItem']
    'SidebarProvider': typeof import("../app/components/ui/sidebar/index")['SidebarProvider']
    'SidebarRail': typeof import("../app/components/ui/sidebar/index")['SidebarRail']
    'SidebarSeparator': typeof import("../app/components/ui/sidebar/index")['SidebarSeparator']
    'SidebarTrigger': typeof import("../app/components/ui/sidebar/index")['SidebarTrigger']
    'Skeleton': typeof import("../app/components/ui/skeleton/index")['Skeleton']
    'Slider': typeof import("../app/components/ui/slider/index")['Slider']
    'Toaster': typeof import("../app/components/ui/sonner/index")['Toaster']
    'Stepper': typeof import("../app/components/ui/stepper/index")['Stepper']
    'StepperDescription': typeof import("../app/components/ui/stepper/index")['StepperDescription']
    'StepperIndicator': typeof import("../app/components/ui/stepper/index")['StepperIndicator']
    'StepperItem': typeof import("../app/components/ui/stepper/index")['StepperItem']
    'StepperSeparator': typeof import("../app/components/ui/stepper/index")['StepperSeparator']
    'StepperTitle': typeof import("../app/components/ui/stepper/index")['StepperTitle']
    'StepperTrigger': typeof import("../app/components/ui/stepper/index")['StepperTrigger']
    'Switch': typeof import("../app/components/ui/switch/index")['Switch']
    'Table': typeof import("../app/components/ui/table/index")['Table']
    'TableBody': typeof import("../app/components/ui/table/index")['TableBody']
    'TableCaption': typeof import("../app/components/ui/table/index")['TableCaption']
    'TableCell': typeof import("../app/components/ui/table/index")['TableCell']
    'TableEmpty': typeof import("../app/components/ui/table/index")['TableEmpty']
    'TableFooter': typeof import("../app/components/ui/table/index")['TableFooter']
    'TableHead': typeof import("../app/components/ui/table/index")['TableHead']
    'TableHeader': typeof import("../app/components/ui/table/index")['TableHeader']
    'TableRow': typeof import("../app/components/ui/table/index")['TableRow']
    'Tabs': typeof import("../app/components/ui/tabs/index")['Tabs']
    'TabsContent': typeof import("../app/components/ui/tabs/index")['TabsContent']
    'TabsList': typeof import("../app/components/ui/tabs/index")['TabsList']
    'TabsTrigger': typeof import("../app/components/ui/tabs/index")['TabsTrigger']
    'TagsInput': typeof import("../app/components/ui/tags-input/index")['TagsInput']
    'TagsInputInput': typeof import("../app/components/ui/tags-input/index")['TagsInputInput']
    'TagsInputItem': typeof import("../app/components/ui/tags-input/index")['TagsInputItem']
    'TagsInputItemDelete': typeof import("../app/components/ui/tags-input/index")['TagsInputItemDelete']
    'TagsInputItemText': typeof import("../app/components/ui/tags-input/index")['TagsInputItemText']
    'Textarea': typeof import("../app/components/ui/textarea/index")['Textarea']
    'Toggle': typeof import("../app/components/ui/toggle/index")['Toggle']
    'ToggleGroup': typeof import("../app/components/ui/toggle-group/index")['ToggleGroup']
    'ToggleGroupItem': typeof import("../app/components/ui/toggle-group/index")['ToggleGroupItem']
    'Tooltip': typeof import("../app/components/ui/tooltip/index")['Tooltip']
    'TooltipContent': typeof import("../app/components/ui/tooltip/index")['TooltipContent']
    'TooltipProvider': typeof import("../app/components/ui/tooltip/index")['TooltipProvider']
    'TooltipTrigger': typeof import("../app/components/ui/tooltip/index")['TooltipTrigger']
    'NuxtPage': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']
      'LazyAppSideBar': LazyComponent<typeof import("../app/components/AppSideBar.vue")['default']>
    'LazyGlobalLoader': LazyComponent<typeof import("../app/components/GlobalLoader.vue")['default']>
    'LazyNavMain': LazyComponent<typeof import("../app/components/NavMain.vue")['default']>
    'LazyNavUser': LazyComponent<typeof import("../app/components/NavUser.vue")['default']>
    'LazyPermissionTree': LazyComponent<typeof import("../app/components/PermissionTree.vue")['default']>
    'LazyPermissionTreeNode': LazyComponent<typeof import("../app/components/PermissionTreeNode.vue")['default']>
    'LazyPermissionWrapper': LazyComponent<typeof import("../app/components/PermissionWrapper.vue")['default']>
    'LazyRegister': LazyComponent<typeof import("../app/components/Register.vue")['default']>
    'LazySidebarMenu': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenu']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyAccordion': LazyComponent<typeof import("../app/components/ui/accordion/index")['Accordion']>
    'LazyAccordionContent': LazyComponent<typeof import("../app/components/ui/accordion/index")['AccordionContent']>
    'LazyAccordionItem': LazyComponent<typeof import("../app/components/ui/accordion/index")['AccordionItem']>
    'LazyAccordionTrigger': LazyComponent<typeof import("../app/components/ui/accordion/index")['AccordionTrigger']>
    'LazyAlert': LazyComponent<typeof import("../app/components/ui/alert/index")['Alert']>
    'LazyAlertDescription': LazyComponent<typeof import("../app/components/ui/alert/index")['AlertDescription']>
    'LazyAlertTitle': LazyComponent<typeof import("../app/components/ui/alert/index")['AlertTitle']>
    'LazyAlertDialog': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialog']>
    'LazyAlertDialogAction': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogAction']>
    'LazyAlertDialogCancel': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogCancel']>
    'LazyAlertDialogContent': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogContent']>
    'LazyAlertDialogDescription': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogDescription']>
    'LazyAlertDialogFooter': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogFooter']>
    'LazyAlertDialogHeader': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogHeader']>
    'LazyAlertDialogTitle': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTitle']>
    'LazyAlertDialogTrigger': LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTrigger']>
    'LazyAspectRatio': LazyComponent<typeof import("../app/components/ui/aspect-ratio/index")['AspectRatio']>
    'LazyAutoForm': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoForm']>
    'LazyAutoFormField': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormField']>
    'LazyAutoFormFieldArray': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldArray']>
    'LazyAutoFormFieldBoolean': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldBoolean']>
    'LazyAutoFormFieldDate': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldDate']>
    'LazyAutoFormFieldEnum': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldEnum']>
    'LazyAutoFormFieldFile': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldFile']>
    'LazyAutoFormFieldInput': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldInput']>
    'LazyAutoFormFieldNumber': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldNumber']>
    'LazyAutoFormFieldObject': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldObject']>
    'LazyAutoFormLabel': LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormLabel']>
    'LazyConfig': LazyComponent<typeof import("../app/components/ui/auto-form/index")['Config']>
    'LazyConfigItem': LazyComponent<typeof import("../app/components/ui/auto-form/index")['ConfigItem']>
    'LazyFieldProps': LazyComponent<typeof import("../app/components/ui/auto-form/index")['FieldProps']>
    'LazyAvatar': LazyComponent<typeof import("../app/components/ui/avatar/index")['Avatar']>
    'LazyAvatarFallback': LazyComponent<typeof import("../app/components/ui/avatar/index")['AvatarFallback']>
    'LazyAvatarImage': LazyComponent<typeof import("../app/components/ui/avatar/index")['AvatarImage']>
    'LazyBreadcrumb': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['Breadcrumb']>
    'LazyBreadcrumbEllipsis': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbEllipsis']>
    'LazyBreadcrumbItem': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbItem']>
    'LazyBreadcrumbLink': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbLink']>
    'LazyBreadcrumbList': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbList']>
    'LazyBreadcrumbPage': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbPage']>
    'LazyBreadcrumbSeparator': LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbSeparator']>
    'LazyButton': LazyComponent<typeof import("../app/components/ui/button/index")['Button']>
    'LazyBadge': LazyComponent<typeof import("../app/components/ui/badge/index")['Badge']>
    'LazyCalendar': LazyComponent<typeof import("../app/components/ui/calendar/index")['Calendar']>
    'LazyCalendarCell': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarCell']>
    'LazyCalendarCellTrigger': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarCellTrigger']>
    'LazyCalendarGrid': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGrid']>
    'LazyCalendarGridBody': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGridBody']>
    'LazyCalendarGridHead': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGridHead']>
    'LazyCalendarGridRow': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGridRow']>
    'LazyCalendarHeadCell': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarHeadCell']>
    'LazyCalendarHeader': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarHeader']>
    'LazyCalendarHeading': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarHeading']>
    'LazyCalendarNextButton': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarNextButton']>
    'LazyCalendarPrevButton': LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarPrevButton']>
    'LazyCard': LazyComponent<typeof import("../app/components/ui/card/index")['Card']>
    'LazyCardAction': LazyComponent<typeof import("../app/components/ui/card/index")['CardAction']>
    'LazyCardContent': LazyComponent<typeof import("../app/components/ui/card/index")['CardContent']>
    'LazyCardDescription': LazyComponent<typeof import("../app/components/ui/card/index")['CardDescription']>
    'LazyCardFooter': LazyComponent<typeof import("../app/components/ui/card/index")['CardFooter']>
    'LazyCardHeader': LazyComponent<typeof import("../app/components/ui/card/index")['CardHeader']>
    'LazyCardTitle': LazyComponent<typeof import("../app/components/ui/card/index")['CardTitle']>
    'LazyCarousel': LazyComponent<typeof import("../app/components/ui/carousel/index")['Carousel']>
    'LazyCarouselContent': LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselContent']>
    'LazyCarouselItem': LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselItem']>
    'LazyCarouselNext': LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselNext']>
    'LazyCarouselPrevious': LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselPrevious']>
    'LazyCarouselApi': LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselApi']>
    'LazyChartCrosshair': LazyComponent<typeof import("../app/components/ui/chart/index")['ChartCrosshair']>
    'LazyChartLegend': LazyComponent<typeof import("../app/components/ui/chart/index")['ChartLegend']>
    'LazyChartSingleTooltip': LazyComponent<typeof import("../app/components/ui/chart/index")['ChartSingleTooltip']>
    'LazyChartTooltip': LazyComponent<typeof import("../app/components/ui/chart/index")['ChartTooltip']>
    'LazyAreaChart': LazyComponent<typeof import("../app/components/ui/chart-area/index")['AreaChart']>
    'LazyBarChart': LazyComponent<typeof import("../app/components/ui/chart-bar/index")['BarChart']>
    'LazyDonutChart': LazyComponent<typeof import("../app/components/ui/chart-donut/index")['DonutChart']>
    'LazyLineChart': LazyComponent<typeof import("../app/components/ui/chart-line/index")['LineChart']>
    'LazyCheckbox': LazyComponent<typeof import("../app/components/ui/checkbox/index")['Checkbox']>
    'LazyCombobox': LazyComponent<typeof import("../app/components/ui/combobox/index")['Combobox']>
    'LazyComboboxAnchor': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxAnchor']>
    'LazyComboboxEmpty': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxEmpty']>
    'LazyComboboxGroup': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxGroup']>
    'LazyComboboxInput': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxInput']>
    'LazyComboboxItem': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxItem']>
    'LazyComboboxItemIndicator': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxItemIndicator']>
    'LazyComboboxList': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxList']>
    'LazyComboboxSeparator': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxSeparator']>
    'LazyComboboxViewport': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxViewport']>
    'LazyComboboxCancel': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxCancel']>
    'LazyComboboxTrigger': LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxTrigger']>
    'LazyCollapsible': LazyComponent<typeof import("../app/components/ui/collapsible/index")['Collapsible']>
    'LazyCollapsibleContent': LazyComponent<typeof import("../app/components/ui/collapsible/index")['CollapsibleContent']>
    'LazyCollapsibleTrigger': LazyComponent<typeof import("../app/components/ui/collapsible/index")['CollapsibleTrigger']>
    'LazyCommand': LazyComponent<typeof import("../app/components/ui/command/index")['Command']>
    'LazyCommandDialog': LazyComponent<typeof import("../app/components/ui/command/index")['CommandDialog']>
    'LazyCommandEmpty': LazyComponent<typeof import("../app/components/ui/command/index")['CommandEmpty']>
    'LazyCommandGroup': LazyComponent<typeof import("../app/components/ui/command/index")['CommandGroup']>
    'LazyCommandInput': LazyComponent<typeof import("../app/components/ui/command/index")['CommandInput']>
    'LazyCommandItem': LazyComponent<typeof import("../app/components/ui/command/index")['CommandItem']>
    'LazyCommandList': LazyComponent<typeof import("../app/components/ui/command/index")['CommandList']>
    'LazyCommandSeparator': LazyComponent<typeof import("../app/components/ui/command/index")['CommandSeparator']>
    'LazyCommandShortcut': LazyComponent<typeof import("../app/components/ui/command/index")['CommandShortcut']>
    'LazyContextMenu': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenu']>
    'LazyContextMenuCheckboxItem': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuCheckboxItem']>
    'LazyContextMenuContent': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuContent']>
    'LazyContextMenuGroup': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuGroup']>
    'LazyContextMenuItem': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuItem']>
    'LazyContextMenuLabel': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuLabel']>
    'LazyContextMenuRadioGroup': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioGroup']>
    'LazyContextMenuRadioItem': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioItem']>
    'LazyContextMenuSeparator': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSeparator']>
    'LazyContextMenuShortcut': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuShortcut']>
    'LazyContextMenuSub': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSub']>
    'LazyContextMenuSubContent': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSubContent']>
    'LazyContextMenuSubTrigger': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSubTrigger']>
    'LazyContextMenuTrigger': LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuTrigger']>
    'LazyDrawer': LazyComponent<typeof import("../app/components/ui/drawer/index")['Drawer']>
    'LazyDrawerClose': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerClose']>
    'LazyDrawerContent': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerContent']>
    'LazyDrawerDescription': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerDescription']>
    'LazyDrawerFooter': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerFooter']>
    'LazyDrawerHeader': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerHeader']>
    'LazyDrawerOverlay': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerOverlay']>
    'LazyDrawerTitle': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerTitle']>
    'LazyDrawerTrigger': LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerTrigger']>
    'LazyDialog': LazyComponent<typeof import("../app/components/ui/dialog/index")['Dialog']>
    'LazyDialogClose': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogClose']>
    'LazyDialogContent': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogContent']>
    'LazyDialogDescription': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogDescription']>
    'LazyDialogFooter': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogFooter']>
    'LazyDialogHeader': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogHeader']>
    'LazyDialogOverlay': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogOverlay']>
    'LazyDialogScrollContent': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogScrollContent']>
    'LazyDialogTitle': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogTitle']>
    'LazyDialogTrigger': LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogTrigger']>
    'LazyFormControl': LazyComponent<typeof import("../app/components/ui/form/index")['FormControl']>
    'LazyFormDescription': LazyComponent<typeof import("../app/components/ui/form/index")['FormDescription']>
    'LazyFormItem': LazyComponent<typeof import("../app/components/ui/form/index")['FormItem']>
    'LazyFormLabel': LazyComponent<typeof import("../app/components/ui/form/index")['FormLabel']>
    'LazyFormMessage': LazyComponent<typeof import("../app/components/ui/form/index")['FormMessage']>
    'LazyFORMITEMINJECTIONKEY': LazyComponent<typeof import("../app/components/ui/form/index")['FORM_ITEM_INJECTION_KEY']>
    'LazyForm': LazyComponent<typeof import("../app/components/ui/form/index")['Form']>
    'LazyFormField': LazyComponent<typeof import("../app/components/ui/form/index")['FormField']>
    'LazyFormFieldArray': LazyComponent<typeof import("../app/components/ui/form/index")['FormFieldArray']>
    'LazyDropdownMenu': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenu']>
    'LazyDropdownMenuCheckboxItem': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuCheckboxItem']>
    'LazyDropdownMenuContent': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuContent']>
    'LazyDropdownMenuGroup': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuGroup']>
    'LazyDropdownMenuItem': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuItem']>
    'LazyDropdownMenuLabel': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuLabel']>
    'LazyDropdownMenuRadioGroup': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioGroup']>
    'LazyDropdownMenuRadioItem': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioItem']>
    'LazyDropdownMenuSeparator': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSeparator']>
    'LazyDropdownMenuShortcut': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuShortcut']>
    'LazyDropdownMenuSub': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSub']>
    'LazyDropdownMenuSubContent': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubContent']>
    'LazyDropdownMenuSubTrigger': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubTrigger']>
    'LazyDropdownMenuTrigger': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuTrigger']>
    'LazyDropdownMenuPortal': LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuPortal']>
    'LazyHoverCard': LazyComponent<typeof import("../app/components/ui/hover-card/index")['HoverCard']>
    'LazyHoverCardContent': LazyComponent<typeof import("../app/components/ui/hover-card/index")['HoverCardContent']>
    'LazyHoverCardTrigger': LazyComponent<typeof import("../app/components/ui/hover-card/index")['HoverCardTrigger']>
    'LazyInput': LazyComponent<typeof import("../app/components/ui/input/index")['Input']>
    'LazyLabel': LazyComponent<typeof import("../app/components/ui/label/index")['Label']>
    'LazyMenubar': LazyComponent<typeof import("../app/components/ui/menubar/index")['Menubar']>
    'LazyMenubarCheckboxItem': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarCheckboxItem']>
    'LazyMenubarContent': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarContent']>
    'LazyMenubarGroup': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarGroup']>
    'LazyMenubarItem': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarItem']>
    'LazyMenubarLabel': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarLabel']>
    'LazyMenubarMenu': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarMenu']>
    'LazyMenubarRadioGroup': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarRadioGroup']>
    'LazyMenubarRadioItem': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarRadioItem']>
    'LazyMenubarSeparator': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSeparator']>
    'LazyMenubarShortcut': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarShortcut']>
    'LazyMenubarSub': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSub']>
    'LazyMenubarSubContent': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSubContent']>
    'LazyMenubarSubTrigger': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSubTrigger']>
    'LazyMenubarTrigger': LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarTrigger']>
    'LazyNavigationMenu': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenu']>
    'LazyNavigationMenuContent': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuContent']>
    'LazyNavigationMenuIndicator': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuIndicator']>
    'LazyNavigationMenuItem': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuItem']>
    'LazyNavigationMenuLink': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuLink']>
    'LazyNavigationMenuList': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuList']>
    'LazyNavigationMenuTrigger': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuTrigger']>
    'LazyNavigationMenuViewport': LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuViewport']>
    'LazyNumberField': LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberField']>
    'LazyNumberFieldContent': LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldContent']>
    'LazyNumberFieldDecrement': LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldDecrement']>
    'LazyNumberFieldIncrement': LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldIncrement']>
    'LazyNumberFieldInput': LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldInput']>
    'LazyPagination': LazyComponent<typeof import("../app/components/ui/pagination/index")['Pagination']>
    'LazyPaginationContent': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationContent']>
    'LazyPaginationEllipsis': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationEllipsis']>
    'LazyPaginationFirst': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationFirst']>
    'LazyPaginationItem': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationItem']>
    'LazyPaginationLast': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationLast']>
    'LazyPaginationNext': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationNext']>
    'LazyPaginationPrevious': LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationPrevious']>
    'LazyPinInput': LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInput']>
    'LazyPinInputGroup': LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInputGroup']>
    'LazyPinInputSeparator': LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInputSeparator']>
    'LazyPinInputSlot': LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInputSlot']>
    'LazyPopover': LazyComponent<typeof import("../app/components/ui/popover/index")['Popover']>
    'LazyPopoverAnchor': LazyComponent<typeof import("../app/components/ui/popover/index")['PopoverAnchor']>
    'LazyPopoverContent': LazyComponent<typeof import("../app/components/ui/popover/index")['PopoverContent']>
    'LazyPopoverTrigger': LazyComponent<typeof import("../app/components/ui/popover/index")['PopoverTrigger']>
    'LazyProgress': LazyComponent<typeof import("../app/components/ui/progress/index")['Progress']>
    'LazyRadioGroup': LazyComponent<typeof import("../app/components/ui/radio-group/index")['RadioGroup']>
    'LazyRadioGroupItem': LazyComponent<typeof import("../app/components/ui/radio-group/index")['RadioGroupItem']>
    'LazyRangeCalendar': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendar']>
    'LazyRangeCalendarCell': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCell']>
    'LazyRangeCalendarCellTrigger': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCellTrigger']>
    'LazyRangeCalendarGrid': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGrid']>
    'LazyRangeCalendarGridBody': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridBody']>
    'LazyRangeCalendarGridHead': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridHead']>
    'LazyRangeCalendarGridRow': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridRow']>
    'LazyRangeCalendarHeadCell': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeadCell']>
    'LazyRangeCalendarHeader': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeader']>
    'LazyRangeCalendarHeading': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeading']>
    'LazyRangeCalendarNextButton': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarNextButton']>
    'LazyRangeCalendarPrevButton': LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarPrevButton']>
    'LazyResizableHandle': LazyComponent<typeof import("../app/components/ui/resizable/index")['ResizableHandle']>
    'LazyResizablePanel': LazyComponent<typeof import("../app/components/ui/resizable/index")['ResizablePanel']>
    'LazyResizablePanelGroup': LazyComponent<typeof import("../app/components/ui/resizable/index")['ResizablePanelGroup']>
    'LazyScrollArea': LazyComponent<typeof import("../app/components/ui/scroll-area/index")['ScrollArea']>
    'LazyScrollBar': LazyComponent<typeof import("../app/components/ui/scroll-area/index")['ScrollBar']>
    'LazySelect': LazyComponent<typeof import("../app/components/ui/select/index")['Select']>
    'LazySelectContent': LazyComponent<typeof import("../app/components/ui/select/index")['SelectContent']>
    'LazySelectGroup': LazyComponent<typeof import("../app/components/ui/select/index")['SelectGroup']>
    'LazySelectItem': LazyComponent<typeof import("../app/components/ui/select/index")['SelectItem']>
    'LazySelectItemText': LazyComponent<typeof import("../app/components/ui/select/index")['SelectItemText']>
    'LazySelectLabel': LazyComponent<typeof import("../app/components/ui/select/index")['SelectLabel']>
    'LazySelectScrollDownButton': LazyComponent<typeof import("../app/components/ui/select/index")['SelectScrollDownButton']>
    'LazySelectScrollUpButton': LazyComponent<typeof import("../app/components/ui/select/index")['SelectScrollUpButton']>
    'LazySelectSeparator': LazyComponent<typeof import("../app/components/ui/select/index")['SelectSeparator']>
    'LazySelectTrigger': LazyComponent<typeof import("../app/components/ui/select/index")['SelectTrigger']>
    'LazySelectValue': LazyComponent<typeof import("../app/components/ui/select/index")['SelectValue']>
    'LazySeparator': LazyComponent<typeof import("../app/components/ui/separator/index")['Separator']>
    'LazySheet': LazyComponent<typeof import("../app/components/ui/sheet/index")['Sheet']>
    'LazySheetClose': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetClose']>
    'LazySheetContent': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetContent']>
    'LazySheetDescription': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetDescription']>
    'LazySheetFooter': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetFooter']>
    'LazySheetHeader': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetHeader']>
    'LazySheetTitle': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetTitle']>
    'LazySheetTrigger': LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetTrigger']>
    'LazySidebar': LazyComponent<typeof import("../app/components/ui/sidebar/index")['Sidebar']>
    'LazySidebarContent': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarContent']>
    'LazySidebarFooter': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarFooter']>
    'LazySidebarGroup': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroup']>
    'LazySidebarGroupAction': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroupAction']>
    'LazySidebarGroupContent': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroupContent']>
    'LazySidebarGroupLabel': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroupLabel']>
    'LazySidebarHeader': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarHeader']>
    'LazySidebarInput': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarInput']>
    'LazySidebarInset': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarInset']>
    'LazySidebarMenuAction': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuAction']>
    'LazySidebarMenuBadge': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuBadge']>
    'LazySidebarMenuButton': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuButton']>
    'LazySidebarMenuItem': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuItem']>
    'LazySidebarMenuSkeleton': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSkeleton']>
    'LazySidebarMenuSub': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSub']>
    'LazySidebarMenuSubButton': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubButton']>
    'LazySidebarMenuSubItem': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubItem']>
    'LazySidebarProvider': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarProvider']>
    'LazySidebarRail': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarRail']>
    'LazySidebarSeparator': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarSeparator']>
    'LazySidebarTrigger': LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarTrigger']>
    'LazySkeleton': LazyComponent<typeof import("../app/components/ui/skeleton/index")['Skeleton']>
    'LazySlider': LazyComponent<typeof import("../app/components/ui/slider/index")['Slider']>
    'LazyToaster': LazyComponent<typeof import("../app/components/ui/sonner/index")['Toaster']>
    'LazyStepper': LazyComponent<typeof import("../app/components/ui/stepper/index")['Stepper']>
    'LazyStepperDescription': LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperDescription']>
    'LazyStepperIndicator': LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperIndicator']>
    'LazyStepperItem': LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperItem']>
    'LazyStepperSeparator': LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperSeparator']>
    'LazyStepperTitle': LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperTitle']>
    'LazyStepperTrigger': LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperTrigger']>
    'LazySwitch': LazyComponent<typeof import("../app/components/ui/switch/index")['Switch']>
    'LazyTable': LazyComponent<typeof import("../app/components/ui/table/index")['Table']>
    'LazyTableBody': LazyComponent<typeof import("../app/components/ui/table/index")['TableBody']>
    'LazyTableCaption': LazyComponent<typeof import("../app/components/ui/table/index")['TableCaption']>
    'LazyTableCell': LazyComponent<typeof import("../app/components/ui/table/index")['TableCell']>
    'LazyTableEmpty': LazyComponent<typeof import("../app/components/ui/table/index")['TableEmpty']>
    'LazyTableFooter': LazyComponent<typeof import("../app/components/ui/table/index")['TableFooter']>
    'LazyTableHead': LazyComponent<typeof import("../app/components/ui/table/index")['TableHead']>
    'LazyTableHeader': LazyComponent<typeof import("../app/components/ui/table/index")['TableHeader']>
    'LazyTableRow': LazyComponent<typeof import("../app/components/ui/table/index")['TableRow']>
    'LazyTabs': LazyComponent<typeof import("../app/components/ui/tabs/index")['Tabs']>
    'LazyTabsContent': LazyComponent<typeof import("../app/components/ui/tabs/index")['TabsContent']>
    'LazyTabsList': LazyComponent<typeof import("../app/components/ui/tabs/index")['TabsList']>
    'LazyTabsTrigger': LazyComponent<typeof import("../app/components/ui/tabs/index")['TabsTrigger']>
    'LazyTagsInput': LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInput']>
    'LazyTagsInputInput': LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputInput']>
    'LazyTagsInputItem': LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputItem']>
    'LazyTagsInputItemDelete': LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputItemDelete']>
    'LazyTagsInputItemText': LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputItemText']>
    'LazyTextarea': LazyComponent<typeof import("../app/components/ui/textarea/index")['Textarea']>
    'LazyToggle': LazyComponent<typeof import("../app/components/ui/toggle/index")['Toggle']>
    'LazyToggleGroup': LazyComponent<typeof import("../app/components/ui/toggle-group/index")['ToggleGroup']>
    'LazyToggleGroupItem': LazyComponent<typeof import("../app/components/ui/toggle-group/index")['ToggleGroupItem']>
    'LazyTooltip': LazyComponent<typeof import("../app/components/ui/tooltip/index")['Tooltip']>
    'LazyTooltipContent': LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipContent']>
    'LazyTooltipProvider': LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipProvider']>
    'LazyTooltipTrigger': LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipTrigger']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const AppSideBar: typeof import("../app/components/AppSideBar.vue")['default']
export const GlobalLoader: typeof import("../app/components/GlobalLoader.vue")['default']
export const NavMain: typeof import("../app/components/NavMain.vue")['default']
export const NavUser: typeof import("../app/components/NavUser.vue")['default']
export const PermissionTree: typeof import("../app/components/PermissionTree.vue")['default']
export const PermissionTreeNode: typeof import("../app/components/PermissionTreeNode.vue")['default']
export const PermissionWrapper: typeof import("../app/components/PermissionWrapper.vue")['default']
export const Register: typeof import("../app/components/Register.vue")['default']
export const SidebarMenu: typeof import("../app/components/ui/sidebar/index")['SidebarMenu']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Accordion: typeof import("../app/components/ui/accordion/index")['Accordion']
export const AccordionContent: typeof import("../app/components/ui/accordion/index")['AccordionContent']
export const AccordionItem: typeof import("../app/components/ui/accordion/index")['AccordionItem']
export const AccordionTrigger: typeof import("../app/components/ui/accordion/index")['AccordionTrigger']
export const Alert: typeof import("../app/components/ui/alert/index")['Alert']
export const AlertDescription: typeof import("../app/components/ui/alert/index")['AlertDescription']
export const AlertTitle: typeof import("../app/components/ui/alert/index")['AlertTitle']
export const AlertDialog: typeof import("../app/components/ui/alert-dialog/index")['AlertDialog']
export const AlertDialogAction: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogAction']
export const AlertDialogCancel: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogCancel']
export const AlertDialogContent: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogContent']
export const AlertDialogDescription: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogDescription']
export const AlertDialogFooter: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogFooter']
export const AlertDialogHeader: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogHeader']
export const AlertDialogTitle: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTitle']
export const AlertDialogTrigger: typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTrigger']
export const AspectRatio: typeof import("../app/components/ui/aspect-ratio/index")['AspectRatio']
export const AutoForm: typeof import("../app/components/ui/auto-form/index")['AutoForm']
export const AutoFormField: typeof import("../app/components/ui/auto-form/index")['AutoFormField']
export const AutoFormFieldArray: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldArray']
export const AutoFormFieldBoolean: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldBoolean']
export const AutoFormFieldDate: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldDate']
export const AutoFormFieldEnum: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldEnum']
export const AutoFormFieldFile: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldFile']
export const AutoFormFieldInput: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldInput']
export const AutoFormFieldNumber: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldNumber']
export const AutoFormFieldObject: typeof import("../app/components/ui/auto-form/index")['AutoFormFieldObject']
export const AutoFormLabel: typeof import("../app/components/ui/auto-form/index")['AutoFormLabel']
export const Config: typeof import("../app/components/ui/auto-form/index")['Config']
export const ConfigItem: typeof import("../app/components/ui/auto-form/index")['ConfigItem']
export const FieldProps: typeof import("../app/components/ui/auto-form/index")['FieldProps']
export const Avatar: typeof import("../app/components/ui/avatar/index")['Avatar']
export const AvatarFallback: typeof import("../app/components/ui/avatar/index")['AvatarFallback']
export const AvatarImage: typeof import("../app/components/ui/avatar/index")['AvatarImage']
export const Breadcrumb: typeof import("../app/components/ui/breadcrumb/index")['Breadcrumb']
export const BreadcrumbEllipsis: typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbEllipsis']
export const BreadcrumbItem: typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbItem']
export const BreadcrumbLink: typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbLink']
export const BreadcrumbList: typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbList']
export const BreadcrumbPage: typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbPage']
export const BreadcrumbSeparator: typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbSeparator']
export const Button: typeof import("../app/components/ui/button/index")['Button']
export const Badge: typeof import("../app/components/ui/badge/index")['Badge']
export const Calendar: typeof import("../app/components/ui/calendar/index")['Calendar']
export const CalendarCell: typeof import("../app/components/ui/calendar/index")['CalendarCell']
export const CalendarCellTrigger: typeof import("../app/components/ui/calendar/index")['CalendarCellTrigger']
export const CalendarGrid: typeof import("../app/components/ui/calendar/index")['CalendarGrid']
export const CalendarGridBody: typeof import("../app/components/ui/calendar/index")['CalendarGridBody']
export const CalendarGridHead: typeof import("../app/components/ui/calendar/index")['CalendarGridHead']
export const CalendarGridRow: typeof import("../app/components/ui/calendar/index")['CalendarGridRow']
export const CalendarHeadCell: typeof import("../app/components/ui/calendar/index")['CalendarHeadCell']
export const CalendarHeader: typeof import("../app/components/ui/calendar/index")['CalendarHeader']
export const CalendarHeading: typeof import("../app/components/ui/calendar/index")['CalendarHeading']
export const CalendarNextButton: typeof import("../app/components/ui/calendar/index")['CalendarNextButton']
export const CalendarPrevButton: typeof import("../app/components/ui/calendar/index")['CalendarPrevButton']
export const Card: typeof import("../app/components/ui/card/index")['Card']
export const CardAction: typeof import("../app/components/ui/card/index")['CardAction']
export const CardContent: typeof import("../app/components/ui/card/index")['CardContent']
export const CardDescription: typeof import("../app/components/ui/card/index")['CardDescription']
export const CardFooter: typeof import("../app/components/ui/card/index")['CardFooter']
export const CardHeader: typeof import("../app/components/ui/card/index")['CardHeader']
export const CardTitle: typeof import("../app/components/ui/card/index")['CardTitle']
export const Carousel: typeof import("../app/components/ui/carousel/index")['Carousel']
export const CarouselContent: typeof import("../app/components/ui/carousel/index")['CarouselContent']
export const CarouselItem: typeof import("../app/components/ui/carousel/index")['CarouselItem']
export const CarouselNext: typeof import("../app/components/ui/carousel/index")['CarouselNext']
export const CarouselPrevious: typeof import("../app/components/ui/carousel/index")['CarouselPrevious']
export const CarouselApi: typeof import("../app/components/ui/carousel/index")['CarouselApi']
export const ChartCrosshair: typeof import("../app/components/ui/chart/index")['ChartCrosshair']
export const ChartLegend: typeof import("../app/components/ui/chart/index")['ChartLegend']
export const ChartSingleTooltip: typeof import("../app/components/ui/chart/index")['ChartSingleTooltip']
export const ChartTooltip: typeof import("../app/components/ui/chart/index")['ChartTooltip']
export const AreaChart: typeof import("../app/components/ui/chart-area/index")['AreaChart']
export const BarChart: typeof import("../app/components/ui/chart-bar/index")['BarChart']
export const DonutChart: typeof import("../app/components/ui/chart-donut/index")['DonutChart']
export const LineChart: typeof import("../app/components/ui/chart-line/index")['LineChart']
export const Checkbox: typeof import("../app/components/ui/checkbox/index")['Checkbox']
export const Combobox: typeof import("../app/components/ui/combobox/index")['Combobox']
export const ComboboxAnchor: typeof import("../app/components/ui/combobox/index")['ComboboxAnchor']
export const ComboboxEmpty: typeof import("../app/components/ui/combobox/index")['ComboboxEmpty']
export const ComboboxGroup: typeof import("../app/components/ui/combobox/index")['ComboboxGroup']
export const ComboboxInput: typeof import("../app/components/ui/combobox/index")['ComboboxInput']
export const ComboboxItem: typeof import("../app/components/ui/combobox/index")['ComboboxItem']
export const ComboboxItemIndicator: typeof import("../app/components/ui/combobox/index")['ComboboxItemIndicator']
export const ComboboxList: typeof import("../app/components/ui/combobox/index")['ComboboxList']
export const ComboboxSeparator: typeof import("../app/components/ui/combobox/index")['ComboboxSeparator']
export const ComboboxViewport: typeof import("../app/components/ui/combobox/index")['ComboboxViewport']
export const ComboboxCancel: typeof import("../app/components/ui/combobox/index")['ComboboxCancel']
export const ComboboxTrigger: typeof import("../app/components/ui/combobox/index")['ComboboxTrigger']
export const Collapsible: typeof import("../app/components/ui/collapsible/index")['Collapsible']
export const CollapsibleContent: typeof import("../app/components/ui/collapsible/index")['CollapsibleContent']
export const CollapsibleTrigger: typeof import("../app/components/ui/collapsible/index")['CollapsibleTrigger']
export const Command: typeof import("../app/components/ui/command/index")['Command']
export const CommandDialog: typeof import("../app/components/ui/command/index")['CommandDialog']
export const CommandEmpty: typeof import("../app/components/ui/command/index")['CommandEmpty']
export const CommandGroup: typeof import("../app/components/ui/command/index")['CommandGroup']
export const CommandInput: typeof import("../app/components/ui/command/index")['CommandInput']
export const CommandItem: typeof import("../app/components/ui/command/index")['CommandItem']
export const CommandList: typeof import("../app/components/ui/command/index")['CommandList']
export const CommandSeparator: typeof import("../app/components/ui/command/index")['CommandSeparator']
export const CommandShortcut: typeof import("../app/components/ui/command/index")['CommandShortcut']
export const ContextMenu: typeof import("../app/components/ui/context-menu/index")['ContextMenu']
export const ContextMenuCheckboxItem: typeof import("../app/components/ui/context-menu/index")['ContextMenuCheckboxItem']
export const ContextMenuContent: typeof import("../app/components/ui/context-menu/index")['ContextMenuContent']
export const ContextMenuGroup: typeof import("../app/components/ui/context-menu/index")['ContextMenuGroup']
export const ContextMenuItem: typeof import("../app/components/ui/context-menu/index")['ContextMenuItem']
export const ContextMenuLabel: typeof import("../app/components/ui/context-menu/index")['ContextMenuLabel']
export const ContextMenuRadioGroup: typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioGroup']
export const ContextMenuRadioItem: typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioItem']
export const ContextMenuSeparator: typeof import("../app/components/ui/context-menu/index")['ContextMenuSeparator']
export const ContextMenuShortcut: typeof import("../app/components/ui/context-menu/index")['ContextMenuShortcut']
export const ContextMenuSub: typeof import("../app/components/ui/context-menu/index")['ContextMenuSub']
export const ContextMenuSubContent: typeof import("../app/components/ui/context-menu/index")['ContextMenuSubContent']
export const ContextMenuSubTrigger: typeof import("../app/components/ui/context-menu/index")['ContextMenuSubTrigger']
export const ContextMenuTrigger: typeof import("../app/components/ui/context-menu/index")['ContextMenuTrigger']
export const Drawer: typeof import("../app/components/ui/drawer/index")['Drawer']
export const DrawerClose: typeof import("../app/components/ui/drawer/index")['DrawerClose']
export const DrawerContent: typeof import("../app/components/ui/drawer/index")['DrawerContent']
export const DrawerDescription: typeof import("../app/components/ui/drawer/index")['DrawerDescription']
export const DrawerFooter: typeof import("../app/components/ui/drawer/index")['DrawerFooter']
export const DrawerHeader: typeof import("../app/components/ui/drawer/index")['DrawerHeader']
export const DrawerOverlay: typeof import("../app/components/ui/drawer/index")['DrawerOverlay']
export const DrawerTitle: typeof import("../app/components/ui/drawer/index")['DrawerTitle']
export const DrawerTrigger: typeof import("../app/components/ui/drawer/index")['DrawerTrigger']
export const Dialog: typeof import("../app/components/ui/dialog/index")['Dialog']
export const DialogClose: typeof import("../app/components/ui/dialog/index")['DialogClose']
export const DialogContent: typeof import("../app/components/ui/dialog/index")['DialogContent']
export const DialogDescription: typeof import("../app/components/ui/dialog/index")['DialogDescription']
export const DialogFooter: typeof import("../app/components/ui/dialog/index")['DialogFooter']
export const DialogHeader: typeof import("../app/components/ui/dialog/index")['DialogHeader']
export const DialogOverlay: typeof import("../app/components/ui/dialog/index")['DialogOverlay']
export const DialogScrollContent: typeof import("../app/components/ui/dialog/index")['DialogScrollContent']
export const DialogTitle: typeof import("../app/components/ui/dialog/index")['DialogTitle']
export const DialogTrigger: typeof import("../app/components/ui/dialog/index")['DialogTrigger']
export const FormControl: typeof import("../app/components/ui/form/index")['FormControl']
export const FormDescription: typeof import("../app/components/ui/form/index")['FormDescription']
export const FormItem: typeof import("../app/components/ui/form/index")['FormItem']
export const FormLabel: typeof import("../app/components/ui/form/index")['FormLabel']
export const FormMessage: typeof import("../app/components/ui/form/index")['FormMessage']
export const FORMITEMINJECTIONKEY: typeof import("../app/components/ui/form/index")['FORM_ITEM_INJECTION_KEY']
export const Form: typeof import("../app/components/ui/form/index")['Form']
export const FormField: typeof import("../app/components/ui/form/index")['FormField']
export const FormFieldArray: typeof import("../app/components/ui/form/index")['FormFieldArray']
export const DropdownMenu: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenu']
export const DropdownMenuCheckboxItem: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuCheckboxItem']
export const DropdownMenuContent: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuContent']
export const DropdownMenuGroup: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuGroup']
export const DropdownMenuItem: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuItem']
export const DropdownMenuLabel: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuLabel']
export const DropdownMenuRadioGroup: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioGroup']
export const DropdownMenuRadioItem: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioItem']
export const DropdownMenuSeparator: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSeparator']
export const DropdownMenuShortcut: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuShortcut']
export const DropdownMenuSub: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSub']
export const DropdownMenuSubContent: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubContent']
export const DropdownMenuSubTrigger: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubTrigger']
export const DropdownMenuTrigger: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuTrigger']
export const DropdownMenuPortal: typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuPortal']
export const HoverCard: typeof import("../app/components/ui/hover-card/index")['HoverCard']
export const HoverCardContent: typeof import("../app/components/ui/hover-card/index")['HoverCardContent']
export const HoverCardTrigger: typeof import("../app/components/ui/hover-card/index")['HoverCardTrigger']
export const Input: typeof import("../app/components/ui/input/index")['Input']
export const Label: typeof import("../app/components/ui/label/index")['Label']
export const Menubar: typeof import("../app/components/ui/menubar/index")['Menubar']
export const MenubarCheckboxItem: typeof import("../app/components/ui/menubar/index")['MenubarCheckboxItem']
export const MenubarContent: typeof import("../app/components/ui/menubar/index")['MenubarContent']
export const MenubarGroup: typeof import("../app/components/ui/menubar/index")['MenubarGroup']
export const MenubarItem: typeof import("../app/components/ui/menubar/index")['MenubarItem']
export const MenubarLabel: typeof import("../app/components/ui/menubar/index")['MenubarLabel']
export const MenubarMenu: typeof import("../app/components/ui/menubar/index")['MenubarMenu']
export const MenubarRadioGroup: typeof import("../app/components/ui/menubar/index")['MenubarRadioGroup']
export const MenubarRadioItem: typeof import("../app/components/ui/menubar/index")['MenubarRadioItem']
export const MenubarSeparator: typeof import("../app/components/ui/menubar/index")['MenubarSeparator']
export const MenubarShortcut: typeof import("../app/components/ui/menubar/index")['MenubarShortcut']
export const MenubarSub: typeof import("../app/components/ui/menubar/index")['MenubarSub']
export const MenubarSubContent: typeof import("../app/components/ui/menubar/index")['MenubarSubContent']
export const MenubarSubTrigger: typeof import("../app/components/ui/menubar/index")['MenubarSubTrigger']
export const MenubarTrigger: typeof import("../app/components/ui/menubar/index")['MenubarTrigger']
export const NavigationMenu: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenu']
export const NavigationMenuContent: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuContent']
export const NavigationMenuIndicator: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuIndicator']
export const NavigationMenuItem: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuItem']
export const NavigationMenuLink: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuLink']
export const NavigationMenuList: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuList']
export const NavigationMenuTrigger: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuTrigger']
export const NavigationMenuViewport: typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuViewport']
export const NumberField: typeof import("../app/components/ui/number-field/index")['NumberField']
export const NumberFieldContent: typeof import("../app/components/ui/number-field/index")['NumberFieldContent']
export const NumberFieldDecrement: typeof import("../app/components/ui/number-field/index")['NumberFieldDecrement']
export const NumberFieldIncrement: typeof import("../app/components/ui/number-field/index")['NumberFieldIncrement']
export const NumberFieldInput: typeof import("../app/components/ui/number-field/index")['NumberFieldInput']
export const Pagination: typeof import("../app/components/ui/pagination/index")['Pagination']
export const PaginationContent: typeof import("../app/components/ui/pagination/index")['PaginationContent']
export const PaginationEllipsis: typeof import("../app/components/ui/pagination/index")['PaginationEllipsis']
export const PaginationFirst: typeof import("../app/components/ui/pagination/index")['PaginationFirst']
export const PaginationItem: typeof import("../app/components/ui/pagination/index")['PaginationItem']
export const PaginationLast: typeof import("../app/components/ui/pagination/index")['PaginationLast']
export const PaginationNext: typeof import("../app/components/ui/pagination/index")['PaginationNext']
export const PaginationPrevious: typeof import("../app/components/ui/pagination/index")['PaginationPrevious']
export const PinInput: typeof import("../app/components/ui/pin-input/index")['PinInput']
export const PinInputGroup: typeof import("../app/components/ui/pin-input/index")['PinInputGroup']
export const PinInputSeparator: typeof import("../app/components/ui/pin-input/index")['PinInputSeparator']
export const PinInputSlot: typeof import("../app/components/ui/pin-input/index")['PinInputSlot']
export const Popover: typeof import("../app/components/ui/popover/index")['Popover']
export const PopoverAnchor: typeof import("../app/components/ui/popover/index")['PopoverAnchor']
export const PopoverContent: typeof import("../app/components/ui/popover/index")['PopoverContent']
export const PopoverTrigger: typeof import("../app/components/ui/popover/index")['PopoverTrigger']
export const Progress: typeof import("../app/components/ui/progress/index")['Progress']
export const RadioGroup: typeof import("../app/components/ui/radio-group/index")['RadioGroup']
export const RadioGroupItem: typeof import("../app/components/ui/radio-group/index")['RadioGroupItem']
export const RangeCalendar: typeof import("../app/components/ui/range-calendar/index")['RangeCalendar']
export const RangeCalendarCell: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCell']
export const RangeCalendarCellTrigger: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCellTrigger']
export const RangeCalendarGrid: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGrid']
export const RangeCalendarGridBody: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridBody']
export const RangeCalendarGridHead: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridHead']
export const RangeCalendarGridRow: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridRow']
export const RangeCalendarHeadCell: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeadCell']
export const RangeCalendarHeader: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeader']
export const RangeCalendarHeading: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeading']
export const RangeCalendarNextButton: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarNextButton']
export const RangeCalendarPrevButton: typeof import("../app/components/ui/range-calendar/index")['RangeCalendarPrevButton']
export const ResizableHandle: typeof import("../app/components/ui/resizable/index")['ResizableHandle']
export const ResizablePanel: typeof import("../app/components/ui/resizable/index")['ResizablePanel']
export const ResizablePanelGroup: typeof import("../app/components/ui/resizable/index")['ResizablePanelGroup']
export const ScrollArea: typeof import("../app/components/ui/scroll-area/index")['ScrollArea']
export const ScrollBar: typeof import("../app/components/ui/scroll-area/index")['ScrollBar']
export const Select: typeof import("../app/components/ui/select/index")['Select']
export const SelectContent: typeof import("../app/components/ui/select/index")['SelectContent']
export const SelectGroup: typeof import("../app/components/ui/select/index")['SelectGroup']
export const SelectItem: typeof import("../app/components/ui/select/index")['SelectItem']
export const SelectItemText: typeof import("../app/components/ui/select/index")['SelectItemText']
export const SelectLabel: typeof import("../app/components/ui/select/index")['SelectLabel']
export const SelectScrollDownButton: typeof import("../app/components/ui/select/index")['SelectScrollDownButton']
export const SelectScrollUpButton: typeof import("../app/components/ui/select/index")['SelectScrollUpButton']
export const SelectSeparator: typeof import("../app/components/ui/select/index")['SelectSeparator']
export const SelectTrigger: typeof import("../app/components/ui/select/index")['SelectTrigger']
export const SelectValue: typeof import("../app/components/ui/select/index")['SelectValue']
export const Separator: typeof import("../app/components/ui/separator/index")['Separator']
export const Sheet: typeof import("../app/components/ui/sheet/index")['Sheet']
export const SheetClose: typeof import("../app/components/ui/sheet/index")['SheetClose']
export const SheetContent: typeof import("../app/components/ui/sheet/index")['SheetContent']
export const SheetDescription: typeof import("../app/components/ui/sheet/index")['SheetDescription']
export const SheetFooter: typeof import("../app/components/ui/sheet/index")['SheetFooter']
export const SheetHeader: typeof import("../app/components/ui/sheet/index")['SheetHeader']
export const SheetTitle: typeof import("../app/components/ui/sheet/index")['SheetTitle']
export const SheetTrigger: typeof import("../app/components/ui/sheet/index")['SheetTrigger']
export const Sidebar: typeof import("../app/components/ui/sidebar/index")['Sidebar']
export const SidebarContent: typeof import("../app/components/ui/sidebar/index")['SidebarContent']
export const SidebarFooter: typeof import("../app/components/ui/sidebar/index")['SidebarFooter']
export const SidebarGroup: typeof import("../app/components/ui/sidebar/index")['SidebarGroup']
export const SidebarGroupAction: typeof import("../app/components/ui/sidebar/index")['SidebarGroupAction']
export const SidebarGroupContent: typeof import("../app/components/ui/sidebar/index")['SidebarGroupContent']
export const SidebarGroupLabel: typeof import("../app/components/ui/sidebar/index")['SidebarGroupLabel']
export const SidebarHeader: typeof import("../app/components/ui/sidebar/index")['SidebarHeader']
export const SidebarInput: typeof import("../app/components/ui/sidebar/index")['SidebarInput']
export const SidebarInset: typeof import("../app/components/ui/sidebar/index")['SidebarInset']
export const SidebarMenuAction: typeof import("../app/components/ui/sidebar/index")['SidebarMenuAction']
export const SidebarMenuBadge: typeof import("../app/components/ui/sidebar/index")['SidebarMenuBadge']
export const SidebarMenuButton: typeof import("../app/components/ui/sidebar/index")['SidebarMenuButton']
export const SidebarMenuItem: typeof import("../app/components/ui/sidebar/index")['SidebarMenuItem']
export const SidebarMenuSkeleton: typeof import("../app/components/ui/sidebar/index")['SidebarMenuSkeleton']
export const SidebarMenuSub: typeof import("../app/components/ui/sidebar/index")['SidebarMenuSub']
export const SidebarMenuSubButton: typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubButton']
export const SidebarMenuSubItem: typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubItem']
export const SidebarProvider: typeof import("../app/components/ui/sidebar/index")['SidebarProvider']
export const SidebarRail: typeof import("../app/components/ui/sidebar/index")['SidebarRail']
export const SidebarSeparator: typeof import("../app/components/ui/sidebar/index")['SidebarSeparator']
export const SidebarTrigger: typeof import("../app/components/ui/sidebar/index")['SidebarTrigger']
export const Skeleton: typeof import("../app/components/ui/skeleton/index")['Skeleton']
export const Slider: typeof import("../app/components/ui/slider/index")['Slider']
export const Toaster: typeof import("../app/components/ui/sonner/index")['Toaster']
export const Stepper: typeof import("../app/components/ui/stepper/index")['Stepper']
export const StepperDescription: typeof import("../app/components/ui/stepper/index")['StepperDescription']
export const StepperIndicator: typeof import("../app/components/ui/stepper/index")['StepperIndicator']
export const StepperItem: typeof import("../app/components/ui/stepper/index")['StepperItem']
export const StepperSeparator: typeof import("../app/components/ui/stepper/index")['StepperSeparator']
export const StepperTitle: typeof import("../app/components/ui/stepper/index")['StepperTitle']
export const StepperTrigger: typeof import("../app/components/ui/stepper/index")['StepperTrigger']
export const Switch: typeof import("../app/components/ui/switch/index")['Switch']
export const Table: typeof import("../app/components/ui/table/index")['Table']
export const TableBody: typeof import("../app/components/ui/table/index")['TableBody']
export const TableCaption: typeof import("../app/components/ui/table/index")['TableCaption']
export const TableCell: typeof import("../app/components/ui/table/index")['TableCell']
export const TableEmpty: typeof import("../app/components/ui/table/index")['TableEmpty']
export const TableFooter: typeof import("../app/components/ui/table/index")['TableFooter']
export const TableHead: typeof import("../app/components/ui/table/index")['TableHead']
export const TableHeader: typeof import("../app/components/ui/table/index")['TableHeader']
export const TableRow: typeof import("../app/components/ui/table/index")['TableRow']
export const Tabs: typeof import("../app/components/ui/tabs/index")['Tabs']
export const TabsContent: typeof import("../app/components/ui/tabs/index")['TabsContent']
export const TabsList: typeof import("../app/components/ui/tabs/index")['TabsList']
export const TabsTrigger: typeof import("../app/components/ui/tabs/index")['TabsTrigger']
export const TagsInput: typeof import("../app/components/ui/tags-input/index")['TagsInput']
export const TagsInputInput: typeof import("../app/components/ui/tags-input/index")['TagsInputInput']
export const TagsInputItem: typeof import("../app/components/ui/tags-input/index")['TagsInputItem']
export const TagsInputItemDelete: typeof import("../app/components/ui/tags-input/index")['TagsInputItemDelete']
export const TagsInputItemText: typeof import("../app/components/ui/tags-input/index")['TagsInputItemText']
export const Textarea: typeof import("../app/components/ui/textarea/index")['Textarea']
export const Toggle: typeof import("../app/components/ui/toggle/index")['Toggle']
export const ToggleGroup: typeof import("../app/components/ui/toggle-group/index")['ToggleGroup']
export const ToggleGroupItem: typeof import("../app/components/ui/toggle-group/index")['ToggleGroupItem']
export const Tooltip: typeof import("../app/components/ui/tooltip/index")['Tooltip']
export const TooltipContent: typeof import("../app/components/ui/tooltip/index")['TooltipContent']
export const TooltipProvider: typeof import("../app/components/ui/tooltip/index")['TooltipProvider']
export const TooltipTrigger: typeof import("../app/components/ui/tooltip/index")['TooltipTrigger']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const LazyAppSideBar: LazyComponent<typeof import("../app/components/AppSideBar.vue")['default']>
export const LazyGlobalLoader: LazyComponent<typeof import("../app/components/GlobalLoader.vue")['default']>
export const LazyNavMain: LazyComponent<typeof import("../app/components/NavMain.vue")['default']>
export const LazyNavUser: LazyComponent<typeof import("../app/components/NavUser.vue")['default']>
export const LazyPermissionTree: LazyComponent<typeof import("../app/components/PermissionTree.vue")['default']>
export const LazyPermissionTreeNode: LazyComponent<typeof import("../app/components/PermissionTreeNode.vue")['default']>
export const LazyPermissionWrapper: LazyComponent<typeof import("../app/components/PermissionWrapper.vue")['default']>
export const LazyRegister: LazyComponent<typeof import("../app/components/Register.vue")['default']>
export const LazySidebarMenu: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenu']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyAccordion: LazyComponent<typeof import("../app/components/ui/accordion/index")['Accordion']>
export const LazyAccordionContent: LazyComponent<typeof import("../app/components/ui/accordion/index")['AccordionContent']>
export const LazyAccordionItem: LazyComponent<typeof import("../app/components/ui/accordion/index")['AccordionItem']>
export const LazyAccordionTrigger: LazyComponent<typeof import("../app/components/ui/accordion/index")['AccordionTrigger']>
export const LazyAlert: LazyComponent<typeof import("../app/components/ui/alert/index")['Alert']>
export const LazyAlertDescription: LazyComponent<typeof import("../app/components/ui/alert/index")['AlertDescription']>
export const LazyAlertTitle: LazyComponent<typeof import("../app/components/ui/alert/index")['AlertTitle']>
export const LazyAlertDialog: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialog']>
export const LazyAlertDialogAction: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogAction']>
export const LazyAlertDialogCancel: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogCancel']>
export const LazyAlertDialogContent: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogContent']>
export const LazyAlertDialogDescription: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogDescription']>
export const LazyAlertDialogFooter: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogFooter']>
export const LazyAlertDialogHeader: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogHeader']>
export const LazyAlertDialogTitle: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTitle']>
export const LazyAlertDialogTrigger: LazyComponent<typeof import("../app/components/ui/alert-dialog/index")['AlertDialogTrigger']>
export const LazyAspectRatio: LazyComponent<typeof import("../app/components/ui/aspect-ratio/index")['AspectRatio']>
export const LazyAutoForm: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoForm']>
export const LazyAutoFormField: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormField']>
export const LazyAutoFormFieldArray: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldArray']>
export const LazyAutoFormFieldBoolean: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldBoolean']>
export const LazyAutoFormFieldDate: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldDate']>
export const LazyAutoFormFieldEnum: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldEnum']>
export const LazyAutoFormFieldFile: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldFile']>
export const LazyAutoFormFieldInput: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldInput']>
export const LazyAutoFormFieldNumber: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldNumber']>
export const LazyAutoFormFieldObject: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormFieldObject']>
export const LazyAutoFormLabel: LazyComponent<typeof import("../app/components/ui/auto-form/index")['AutoFormLabel']>
export const LazyConfig: LazyComponent<typeof import("../app/components/ui/auto-form/index")['Config']>
export const LazyConfigItem: LazyComponent<typeof import("../app/components/ui/auto-form/index")['ConfigItem']>
export const LazyFieldProps: LazyComponent<typeof import("../app/components/ui/auto-form/index")['FieldProps']>
export const LazyAvatar: LazyComponent<typeof import("../app/components/ui/avatar/index")['Avatar']>
export const LazyAvatarFallback: LazyComponent<typeof import("../app/components/ui/avatar/index")['AvatarFallback']>
export const LazyAvatarImage: LazyComponent<typeof import("../app/components/ui/avatar/index")['AvatarImage']>
export const LazyBreadcrumb: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['Breadcrumb']>
export const LazyBreadcrumbEllipsis: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbEllipsis']>
export const LazyBreadcrumbItem: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbItem']>
export const LazyBreadcrumbLink: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbLink']>
export const LazyBreadcrumbList: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbList']>
export const LazyBreadcrumbPage: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbPage']>
export const LazyBreadcrumbSeparator: LazyComponent<typeof import("../app/components/ui/breadcrumb/index")['BreadcrumbSeparator']>
export const LazyButton: LazyComponent<typeof import("../app/components/ui/button/index")['Button']>
export const LazyBadge: LazyComponent<typeof import("../app/components/ui/badge/index")['Badge']>
export const LazyCalendar: LazyComponent<typeof import("../app/components/ui/calendar/index")['Calendar']>
export const LazyCalendarCell: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarCell']>
export const LazyCalendarCellTrigger: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarCellTrigger']>
export const LazyCalendarGrid: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGrid']>
export const LazyCalendarGridBody: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGridBody']>
export const LazyCalendarGridHead: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGridHead']>
export const LazyCalendarGridRow: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarGridRow']>
export const LazyCalendarHeadCell: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarHeadCell']>
export const LazyCalendarHeader: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarHeader']>
export const LazyCalendarHeading: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarHeading']>
export const LazyCalendarNextButton: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarNextButton']>
export const LazyCalendarPrevButton: LazyComponent<typeof import("../app/components/ui/calendar/index")['CalendarPrevButton']>
export const LazyCard: LazyComponent<typeof import("../app/components/ui/card/index")['Card']>
export const LazyCardAction: LazyComponent<typeof import("../app/components/ui/card/index")['CardAction']>
export const LazyCardContent: LazyComponent<typeof import("../app/components/ui/card/index")['CardContent']>
export const LazyCardDescription: LazyComponent<typeof import("../app/components/ui/card/index")['CardDescription']>
export const LazyCardFooter: LazyComponent<typeof import("../app/components/ui/card/index")['CardFooter']>
export const LazyCardHeader: LazyComponent<typeof import("../app/components/ui/card/index")['CardHeader']>
export const LazyCardTitle: LazyComponent<typeof import("../app/components/ui/card/index")['CardTitle']>
export const LazyCarousel: LazyComponent<typeof import("../app/components/ui/carousel/index")['Carousel']>
export const LazyCarouselContent: LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselContent']>
export const LazyCarouselItem: LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselItem']>
export const LazyCarouselNext: LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselNext']>
export const LazyCarouselPrevious: LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselPrevious']>
export const LazyCarouselApi: LazyComponent<typeof import("../app/components/ui/carousel/index")['CarouselApi']>
export const LazyChartCrosshair: LazyComponent<typeof import("../app/components/ui/chart/index")['ChartCrosshair']>
export const LazyChartLegend: LazyComponent<typeof import("../app/components/ui/chart/index")['ChartLegend']>
export const LazyChartSingleTooltip: LazyComponent<typeof import("../app/components/ui/chart/index")['ChartSingleTooltip']>
export const LazyChartTooltip: LazyComponent<typeof import("../app/components/ui/chart/index")['ChartTooltip']>
export const LazyAreaChart: LazyComponent<typeof import("../app/components/ui/chart-area/index")['AreaChart']>
export const LazyBarChart: LazyComponent<typeof import("../app/components/ui/chart-bar/index")['BarChart']>
export const LazyDonutChart: LazyComponent<typeof import("../app/components/ui/chart-donut/index")['DonutChart']>
export const LazyLineChart: LazyComponent<typeof import("../app/components/ui/chart-line/index")['LineChart']>
export const LazyCheckbox: LazyComponent<typeof import("../app/components/ui/checkbox/index")['Checkbox']>
export const LazyCombobox: LazyComponent<typeof import("../app/components/ui/combobox/index")['Combobox']>
export const LazyComboboxAnchor: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxAnchor']>
export const LazyComboboxEmpty: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxEmpty']>
export const LazyComboboxGroup: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxGroup']>
export const LazyComboboxInput: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxInput']>
export const LazyComboboxItem: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxItem']>
export const LazyComboboxItemIndicator: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxItemIndicator']>
export const LazyComboboxList: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxList']>
export const LazyComboboxSeparator: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxSeparator']>
export const LazyComboboxViewport: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxViewport']>
export const LazyComboboxCancel: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxCancel']>
export const LazyComboboxTrigger: LazyComponent<typeof import("../app/components/ui/combobox/index")['ComboboxTrigger']>
export const LazyCollapsible: LazyComponent<typeof import("../app/components/ui/collapsible/index")['Collapsible']>
export const LazyCollapsibleContent: LazyComponent<typeof import("../app/components/ui/collapsible/index")['CollapsibleContent']>
export const LazyCollapsibleTrigger: LazyComponent<typeof import("../app/components/ui/collapsible/index")['CollapsibleTrigger']>
export const LazyCommand: LazyComponent<typeof import("../app/components/ui/command/index")['Command']>
export const LazyCommandDialog: LazyComponent<typeof import("../app/components/ui/command/index")['CommandDialog']>
export const LazyCommandEmpty: LazyComponent<typeof import("../app/components/ui/command/index")['CommandEmpty']>
export const LazyCommandGroup: LazyComponent<typeof import("../app/components/ui/command/index")['CommandGroup']>
export const LazyCommandInput: LazyComponent<typeof import("../app/components/ui/command/index")['CommandInput']>
export const LazyCommandItem: LazyComponent<typeof import("../app/components/ui/command/index")['CommandItem']>
export const LazyCommandList: LazyComponent<typeof import("../app/components/ui/command/index")['CommandList']>
export const LazyCommandSeparator: LazyComponent<typeof import("../app/components/ui/command/index")['CommandSeparator']>
export const LazyCommandShortcut: LazyComponent<typeof import("../app/components/ui/command/index")['CommandShortcut']>
export const LazyContextMenu: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenu']>
export const LazyContextMenuCheckboxItem: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuCheckboxItem']>
export const LazyContextMenuContent: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuContent']>
export const LazyContextMenuGroup: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuGroup']>
export const LazyContextMenuItem: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuItem']>
export const LazyContextMenuLabel: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuLabel']>
export const LazyContextMenuRadioGroup: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioGroup']>
export const LazyContextMenuRadioItem: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuRadioItem']>
export const LazyContextMenuSeparator: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSeparator']>
export const LazyContextMenuShortcut: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuShortcut']>
export const LazyContextMenuSub: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSub']>
export const LazyContextMenuSubContent: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSubContent']>
export const LazyContextMenuSubTrigger: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuSubTrigger']>
export const LazyContextMenuTrigger: LazyComponent<typeof import("../app/components/ui/context-menu/index")['ContextMenuTrigger']>
export const LazyDrawer: LazyComponent<typeof import("../app/components/ui/drawer/index")['Drawer']>
export const LazyDrawerClose: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerClose']>
export const LazyDrawerContent: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerContent']>
export const LazyDrawerDescription: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerDescription']>
export const LazyDrawerFooter: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerFooter']>
export const LazyDrawerHeader: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerHeader']>
export const LazyDrawerOverlay: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerOverlay']>
export const LazyDrawerTitle: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerTitle']>
export const LazyDrawerTrigger: LazyComponent<typeof import("../app/components/ui/drawer/index")['DrawerTrigger']>
export const LazyDialog: LazyComponent<typeof import("../app/components/ui/dialog/index")['Dialog']>
export const LazyDialogClose: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogClose']>
export const LazyDialogContent: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogContent']>
export const LazyDialogDescription: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogDescription']>
export const LazyDialogFooter: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogFooter']>
export const LazyDialogHeader: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogHeader']>
export const LazyDialogOverlay: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogOverlay']>
export const LazyDialogScrollContent: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogScrollContent']>
export const LazyDialogTitle: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogTitle']>
export const LazyDialogTrigger: LazyComponent<typeof import("../app/components/ui/dialog/index")['DialogTrigger']>
export const LazyFormControl: LazyComponent<typeof import("../app/components/ui/form/index")['FormControl']>
export const LazyFormDescription: LazyComponent<typeof import("../app/components/ui/form/index")['FormDescription']>
export const LazyFormItem: LazyComponent<typeof import("../app/components/ui/form/index")['FormItem']>
export const LazyFormLabel: LazyComponent<typeof import("../app/components/ui/form/index")['FormLabel']>
export const LazyFormMessage: LazyComponent<typeof import("../app/components/ui/form/index")['FormMessage']>
export const LazyFORMITEMINJECTIONKEY: LazyComponent<typeof import("../app/components/ui/form/index")['FORM_ITEM_INJECTION_KEY']>
export const LazyForm: LazyComponent<typeof import("../app/components/ui/form/index")['Form']>
export const LazyFormField: LazyComponent<typeof import("../app/components/ui/form/index")['FormField']>
export const LazyFormFieldArray: LazyComponent<typeof import("../app/components/ui/form/index")['FormFieldArray']>
export const LazyDropdownMenu: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenu']>
export const LazyDropdownMenuCheckboxItem: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuCheckboxItem']>
export const LazyDropdownMenuContent: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuContent']>
export const LazyDropdownMenuGroup: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuGroup']>
export const LazyDropdownMenuItem: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuItem']>
export const LazyDropdownMenuLabel: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuLabel']>
export const LazyDropdownMenuRadioGroup: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioGroup']>
export const LazyDropdownMenuRadioItem: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuRadioItem']>
export const LazyDropdownMenuSeparator: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSeparator']>
export const LazyDropdownMenuShortcut: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuShortcut']>
export const LazyDropdownMenuSub: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSub']>
export const LazyDropdownMenuSubContent: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubContent']>
export const LazyDropdownMenuSubTrigger: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuSubTrigger']>
export const LazyDropdownMenuTrigger: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuTrigger']>
export const LazyDropdownMenuPortal: LazyComponent<typeof import("../app/components/ui/dropdown-menu/index")['DropdownMenuPortal']>
export const LazyHoverCard: LazyComponent<typeof import("../app/components/ui/hover-card/index")['HoverCard']>
export const LazyHoverCardContent: LazyComponent<typeof import("../app/components/ui/hover-card/index")['HoverCardContent']>
export const LazyHoverCardTrigger: LazyComponent<typeof import("../app/components/ui/hover-card/index")['HoverCardTrigger']>
export const LazyInput: LazyComponent<typeof import("../app/components/ui/input/index")['Input']>
export const LazyLabel: LazyComponent<typeof import("../app/components/ui/label/index")['Label']>
export const LazyMenubar: LazyComponent<typeof import("../app/components/ui/menubar/index")['Menubar']>
export const LazyMenubarCheckboxItem: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarCheckboxItem']>
export const LazyMenubarContent: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarContent']>
export const LazyMenubarGroup: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarGroup']>
export const LazyMenubarItem: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarItem']>
export const LazyMenubarLabel: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarLabel']>
export const LazyMenubarMenu: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarMenu']>
export const LazyMenubarRadioGroup: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarRadioGroup']>
export const LazyMenubarRadioItem: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarRadioItem']>
export const LazyMenubarSeparator: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSeparator']>
export const LazyMenubarShortcut: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarShortcut']>
export const LazyMenubarSub: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSub']>
export const LazyMenubarSubContent: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSubContent']>
export const LazyMenubarSubTrigger: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarSubTrigger']>
export const LazyMenubarTrigger: LazyComponent<typeof import("../app/components/ui/menubar/index")['MenubarTrigger']>
export const LazyNavigationMenu: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenu']>
export const LazyNavigationMenuContent: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuContent']>
export const LazyNavigationMenuIndicator: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuIndicator']>
export const LazyNavigationMenuItem: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuItem']>
export const LazyNavigationMenuLink: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuLink']>
export const LazyNavigationMenuList: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuList']>
export const LazyNavigationMenuTrigger: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuTrigger']>
export const LazyNavigationMenuViewport: LazyComponent<typeof import("../app/components/ui/navigation-menu/index")['NavigationMenuViewport']>
export const LazyNumberField: LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberField']>
export const LazyNumberFieldContent: LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldContent']>
export const LazyNumberFieldDecrement: LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldDecrement']>
export const LazyNumberFieldIncrement: LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldIncrement']>
export const LazyNumberFieldInput: LazyComponent<typeof import("../app/components/ui/number-field/index")['NumberFieldInput']>
export const LazyPagination: LazyComponent<typeof import("../app/components/ui/pagination/index")['Pagination']>
export const LazyPaginationContent: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationContent']>
export const LazyPaginationEllipsis: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationEllipsis']>
export const LazyPaginationFirst: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationFirst']>
export const LazyPaginationItem: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationItem']>
export const LazyPaginationLast: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationLast']>
export const LazyPaginationNext: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationNext']>
export const LazyPaginationPrevious: LazyComponent<typeof import("../app/components/ui/pagination/index")['PaginationPrevious']>
export const LazyPinInput: LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInput']>
export const LazyPinInputGroup: LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInputGroup']>
export const LazyPinInputSeparator: LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInputSeparator']>
export const LazyPinInputSlot: LazyComponent<typeof import("../app/components/ui/pin-input/index")['PinInputSlot']>
export const LazyPopover: LazyComponent<typeof import("../app/components/ui/popover/index")['Popover']>
export const LazyPopoverAnchor: LazyComponent<typeof import("../app/components/ui/popover/index")['PopoverAnchor']>
export const LazyPopoverContent: LazyComponent<typeof import("../app/components/ui/popover/index")['PopoverContent']>
export const LazyPopoverTrigger: LazyComponent<typeof import("../app/components/ui/popover/index")['PopoverTrigger']>
export const LazyProgress: LazyComponent<typeof import("../app/components/ui/progress/index")['Progress']>
export const LazyRadioGroup: LazyComponent<typeof import("../app/components/ui/radio-group/index")['RadioGroup']>
export const LazyRadioGroupItem: LazyComponent<typeof import("../app/components/ui/radio-group/index")['RadioGroupItem']>
export const LazyRangeCalendar: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendar']>
export const LazyRangeCalendarCell: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCell']>
export const LazyRangeCalendarCellTrigger: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarCellTrigger']>
export const LazyRangeCalendarGrid: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGrid']>
export const LazyRangeCalendarGridBody: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridBody']>
export const LazyRangeCalendarGridHead: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridHead']>
export const LazyRangeCalendarGridRow: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarGridRow']>
export const LazyRangeCalendarHeadCell: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeadCell']>
export const LazyRangeCalendarHeader: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeader']>
export const LazyRangeCalendarHeading: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarHeading']>
export const LazyRangeCalendarNextButton: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarNextButton']>
export const LazyRangeCalendarPrevButton: LazyComponent<typeof import("../app/components/ui/range-calendar/index")['RangeCalendarPrevButton']>
export const LazyResizableHandle: LazyComponent<typeof import("../app/components/ui/resizable/index")['ResizableHandle']>
export const LazyResizablePanel: LazyComponent<typeof import("../app/components/ui/resizable/index")['ResizablePanel']>
export const LazyResizablePanelGroup: LazyComponent<typeof import("../app/components/ui/resizable/index")['ResizablePanelGroup']>
export const LazyScrollArea: LazyComponent<typeof import("../app/components/ui/scroll-area/index")['ScrollArea']>
export const LazyScrollBar: LazyComponent<typeof import("../app/components/ui/scroll-area/index")['ScrollBar']>
export const LazySelect: LazyComponent<typeof import("../app/components/ui/select/index")['Select']>
export const LazySelectContent: LazyComponent<typeof import("../app/components/ui/select/index")['SelectContent']>
export const LazySelectGroup: LazyComponent<typeof import("../app/components/ui/select/index")['SelectGroup']>
export const LazySelectItem: LazyComponent<typeof import("../app/components/ui/select/index")['SelectItem']>
export const LazySelectItemText: LazyComponent<typeof import("../app/components/ui/select/index")['SelectItemText']>
export const LazySelectLabel: LazyComponent<typeof import("../app/components/ui/select/index")['SelectLabel']>
export const LazySelectScrollDownButton: LazyComponent<typeof import("../app/components/ui/select/index")['SelectScrollDownButton']>
export const LazySelectScrollUpButton: LazyComponent<typeof import("../app/components/ui/select/index")['SelectScrollUpButton']>
export const LazySelectSeparator: LazyComponent<typeof import("../app/components/ui/select/index")['SelectSeparator']>
export const LazySelectTrigger: LazyComponent<typeof import("../app/components/ui/select/index")['SelectTrigger']>
export const LazySelectValue: LazyComponent<typeof import("../app/components/ui/select/index")['SelectValue']>
export const LazySeparator: LazyComponent<typeof import("../app/components/ui/separator/index")['Separator']>
export const LazySheet: LazyComponent<typeof import("../app/components/ui/sheet/index")['Sheet']>
export const LazySheetClose: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetClose']>
export const LazySheetContent: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetContent']>
export const LazySheetDescription: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetDescription']>
export const LazySheetFooter: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetFooter']>
export const LazySheetHeader: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetHeader']>
export const LazySheetTitle: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetTitle']>
export const LazySheetTrigger: LazyComponent<typeof import("../app/components/ui/sheet/index")['SheetTrigger']>
export const LazySidebar: LazyComponent<typeof import("../app/components/ui/sidebar/index")['Sidebar']>
export const LazySidebarContent: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarContent']>
export const LazySidebarFooter: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarFooter']>
export const LazySidebarGroup: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroup']>
export const LazySidebarGroupAction: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroupAction']>
export const LazySidebarGroupContent: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroupContent']>
export const LazySidebarGroupLabel: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarGroupLabel']>
export const LazySidebarHeader: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarHeader']>
export const LazySidebarInput: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarInput']>
export const LazySidebarInset: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarInset']>
export const LazySidebarMenuAction: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuAction']>
export const LazySidebarMenuBadge: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuBadge']>
export const LazySidebarMenuButton: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuButton']>
export const LazySidebarMenuItem: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuItem']>
export const LazySidebarMenuSkeleton: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSkeleton']>
export const LazySidebarMenuSub: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSub']>
export const LazySidebarMenuSubButton: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubButton']>
export const LazySidebarMenuSubItem: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarMenuSubItem']>
export const LazySidebarProvider: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarProvider']>
export const LazySidebarRail: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarRail']>
export const LazySidebarSeparator: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarSeparator']>
export const LazySidebarTrigger: LazyComponent<typeof import("../app/components/ui/sidebar/index")['SidebarTrigger']>
export const LazySkeleton: LazyComponent<typeof import("../app/components/ui/skeleton/index")['Skeleton']>
export const LazySlider: LazyComponent<typeof import("../app/components/ui/slider/index")['Slider']>
export const LazyToaster: LazyComponent<typeof import("../app/components/ui/sonner/index")['Toaster']>
export const LazyStepper: LazyComponent<typeof import("../app/components/ui/stepper/index")['Stepper']>
export const LazyStepperDescription: LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperDescription']>
export const LazyStepperIndicator: LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperIndicator']>
export const LazyStepperItem: LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperItem']>
export const LazyStepperSeparator: LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperSeparator']>
export const LazyStepperTitle: LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperTitle']>
export const LazyStepperTrigger: LazyComponent<typeof import("../app/components/ui/stepper/index")['StepperTrigger']>
export const LazySwitch: LazyComponent<typeof import("../app/components/ui/switch/index")['Switch']>
export const LazyTable: LazyComponent<typeof import("../app/components/ui/table/index")['Table']>
export const LazyTableBody: LazyComponent<typeof import("../app/components/ui/table/index")['TableBody']>
export const LazyTableCaption: LazyComponent<typeof import("../app/components/ui/table/index")['TableCaption']>
export const LazyTableCell: LazyComponent<typeof import("../app/components/ui/table/index")['TableCell']>
export const LazyTableEmpty: LazyComponent<typeof import("../app/components/ui/table/index")['TableEmpty']>
export const LazyTableFooter: LazyComponent<typeof import("../app/components/ui/table/index")['TableFooter']>
export const LazyTableHead: LazyComponent<typeof import("../app/components/ui/table/index")['TableHead']>
export const LazyTableHeader: LazyComponent<typeof import("../app/components/ui/table/index")['TableHeader']>
export const LazyTableRow: LazyComponent<typeof import("../app/components/ui/table/index")['TableRow']>
export const LazyTabs: LazyComponent<typeof import("../app/components/ui/tabs/index")['Tabs']>
export const LazyTabsContent: LazyComponent<typeof import("../app/components/ui/tabs/index")['TabsContent']>
export const LazyTabsList: LazyComponent<typeof import("../app/components/ui/tabs/index")['TabsList']>
export const LazyTabsTrigger: LazyComponent<typeof import("../app/components/ui/tabs/index")['TabsTrigger']>
export const LazyTagsInput: LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInput']>
export const LazyTagsInputInput: LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputInput']>
export const LazyTagsInputItem: LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputItem']>
export const LazyTagsInputItemDelete: LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputItemDelete']>
export const LazyTagsInputItemText: LazyComponent<typeof import("../app/components/ui/tags-input/index")['TagsInputItemText']>
export const LazyTextarea: LazyComponent<typeof import("../app/components/ui/textarea/index")['Textarea']>
export const LazyToggle: LazyComponent<typeof import("../app/components/ui/toggle/index")['Toggle']>
export const LazyToggleGroup: LazyComponent<typeof import("../app/components/ui/toggle-group/index")['ToggleGroup']>
export const LazyToggleGroupItem: LazyComponent<typeof import("../app/components/ui/toggle-group/index")['ToggleGroupItem']>
export const LazyTooltip: LazyComponent<typeof import("../app/components/ui/tooltip/index")['Tooltip']>
export const LazyTooltipContent: LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipContent']>
export const LazyTooltipProvider: LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipProvider']>
export const LazyTooltipTrigger: LazyComponent<typeof import("../app/components/ui/tooltip/index")['TooltipTrigger']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.0.3_@netlify+blobs@9_12217eec200f4d96d034a7d226e980c7/node_modules/nuxt/dist/app/components/server-placeholder")['default']>

export const componentNames: string[]
