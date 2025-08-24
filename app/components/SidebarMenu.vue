<template>
    <Panel
class="h-full border-none" :pt="{
        root: { class: 'bg-surface-900 text-surface-0 h-full flex flex-col' },
        header: { class: 'hidden' },
        content: { class: 'p-0 h-full flex flex-col' },
    }">
        <Menu :model="items" class="h-full flex flex-col border-none bg-transparent text-surface-0">
            <template #start>
                <Panel
class="border-none" :pt="{
                    root: { class: 'bg-transparent' },
                    header: { class: 'hidden' },
                    content: { class: 'p-6 border-b border-surface-700' },
                }">
                    <div class="flex align-items-center justify-content-between">
                        <div v-if="!sidebarCollapsed" class="flex align-items-center gap-3">
                            <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-2rem w-2rem">
                                <path
                                    d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                                    fill="var(--primary-color)"
                                />
                                <path
                                    d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                                    fill="var(--text-color)"
                                />
                            </svg>
                            <div class="flex flex-column">
                                <span class="text-lg font-bold text-surface-0">智能ERP</span>
                                <small class="text-surface-400">企业管理系统</small>
                            </div>
                        </div>
                        <Button
                            :icon="sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
                            text
                            rounded
                            size="small"
                            severity="secondary"
                            @click="toggleSidebar"
                        />
                    </div>
                </Panel>
            </template>

            <template #submenuheader="{ item }">
                <div class="p-menuitem-content">
                    <span class="text-primary font-bold text-xs uppercase tracking-wider p-3">{{ item.label }}</span>
                </div>
            </template>

            <template #item="{ item, props }">
                <NuxtLink 
                    v-if="item.route" 
                    v-ripple 
                    :to="item.route" 
                    class="p-menuitem-link flex align-items-center p-3 text-surface-300 hover:text-surface-0 hover:bg-surface-700 transition-all duration-200 border-none relative"
                    :class="{ 'text-surface-0 bg-surface-700': $route.path === item.route }"
                    v-bind="props.action"
                >
                    <i :class="item.icon" class="mr-3 text-lg" />
                    <span v-if="!sidebarCollapsed" class="font-medium">{{ item.label }}</span>
                    <Badge v-if="item.badge && !sidebarCollapsed" class="ml-auto" :value="item.badge" />
                    <Chip 
                        v-if="item.shortcut && !sidebarCollapsed" 
                        :label="item.shortcut" 
                        class="ml-auto p-1"
                        :pt="{
                            root: { class: 'text-xs bg-surface-100 text-surface-900' },
                        }"
                    />
                    <Tag 
                        v-if="!sidebarCollapsed && $route.path === item.route" 
                        severity="primary"
                        class="absolute right-2 w-2 h-2 p-0"
                        :pt="{
                            root: { class: 'w-0.5rem h-0.5rem' },
                        }"
                    />
                </NuxtLink>
                <div 
                    v-else 
                    v-ripple 
                    class="p-menuitem-link flex align-items-center p-3 text-surface-300 hover:text-surface-0 hover:bg-surface-700 transition-all duration-200 cursor-pointer border-none"
                    v-bind="props.action"
                >
                    <i :class="item.icon" class="mr-3 text-lg" />
                    <span v-if="!sidebarCollapsed" class="font-medium">{{ item.label }}</span>
                    <Badge v-if="item.badge && !sidebarCollapsed" class="ml-auto" :value="item.badge" />
                    <Chip 
                        v-if="item.shortcut && !sidebarCollapsed" 
                        :label="item.shortcut" 
                        class="ml-auto p-1"
                        :pt="{
                            root: { class: 'text-xs bg-surface-100 text-surface-900' },
                        }"
                    />
                </div>
            </template>

            <template #end>
                <Divider
class="my-0" :pt="{
                    root: { class: 'border-surface-700' },
                }" />
                <Panel
class="border-none" :pt="{
                    root: { class: 'bg-transparent' },
                    header: { class: 'hidden' },
                    content: { class: 'p-4' },
                }">
                    <div class="flex align-items-center justify-content-between">
                        <div v-if="!sidebarCollapsed" class="flex align-items-center gap-3">
                            <Avatar
                                :label="user?.email?.charAt(0)?.toUpperCase() || 'U'"
                                shape="circle"
                                size="normal"
                                class="bg-primary text-white"
                            />
                            <div class="flex flex-column flex-1">
                                <span class="text-sm font-medium text-surface-0 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                    {{ user?.email || '未登录' }}
                                </span>
                                <small class="text-surface-400">管理员</small>
                            </div>
                        </div>
                        <div class="flex align-items-center gap-1">
                            <Button
                                v-if="!sidebarCollapsed"
                                v-tooltip.top="'设置'"
                                icon="pi pi-cog"
                                text
                                rounded
                                size="small"
                                severity="secondary"
                                @click="goToSettings"
                            />
                            <Button
                                icon="pi pi-sign-out"
                                text
                                rounded
                                size="small"
                                severity="danger"
                                :v-tooltip="sidebarCollapsed ? 'right' : 'top'"
                                :tooltip="'退出登录'"
                                @click="logout"
                            />
                        </div>
                    </div>
                </Panel>
            </template>
        </Menu>
    </Panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Menu from 'primevue/menu'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'

// Props
const props = defineProps<{
    sidebarCollapsed: boolean
}>()

// Emits
const emit = defineEmits<{
    toggleSidebar: []
}>()

// 获取用户信息
const user = useSupabaseUser()

// 菜单项配置
const items = ref([
    {
        separator: true
    },
    // 仪表盘
    {
        label: '仪表盘',
        icon: 'pi pi-home',
        route: '/dashboard'
    },
    {
        separator: true
    },
    // 销售管理
    {
        label: '销售管理',
        items: [
            {
                label: '销售订单',
                icon: 'pi pi-shopping-cart',
                route: '/sales/orders',
                badge: '5',
                shortcut: '⌘+S'
            },
            {
                label: '客户管理',
                icon: 'pi pi-users',
                route: '/sales/customers'
            }
        ]
    },
    // 采购管理
    {
        label: '采购管理',
        items: [
            {
                label: '采购订单',
                icon: 'pi pi-shopping-bag',
                route: '/purchase/orders'
            },
            {
                label: '供应商管理',
                icon: 'pi pi-truck',
                route: '/purchase/suppliers'
            }
        ]
    },
    // 库存管理
    {
        label: '库存管理',
        items: [
            {
                label: '库存管理',
                icon: 'pi pi-box',
                route: '/warehouse/inventory'
            },
            {
                label: '仓库管理',
                icon: 'pi pi-building',
                route: '/warehouse/warehouses'
            },
            {
                label: '库存调拨',
                icon: 'pi pi-refresh',
                route: '/warehouse/transfers'
            }
        ]
    },
    // 生产管理
    {
        label: '生产管理',
        items: [
            {
                label: '生产订单',
                icon: 'pi pi-cog',
                route: '/production/orders'
            },
            {
                label: '生产计划',
                icon: 'pi pi-calendar',
                route: '/production/plans'
            },
            {
                label: '物料清单',
                icon: 'pi pi-list',
                route: '/production/bom'
            },
            {
                label: '车间管理',
                icon: 'pi pi-building',
                route: '/production/workshops'
            }
        ]
    },
    // 财务管理
    {
        label: '财务管理',
        items: [
            {
                label: '发票管理',
                icon: 'pi pi-file-edit',
                route: '/finance/invoices',
                badge: '3'
            },
            {
                label: '付款管理',
                icon: 'pi pi-credit-card',
                route: '/finance/payments'
            },
            {
                label: '收款管理',
                icon: 'pi pi-receipt',
                route: '/finance/receipts'
            }
        ]
    },
    // 基础数据
    {
        label: '基础数据',
        items: [
            {
                label: '产品管理',
                icon: 'pi pi-tag',
                route: '/master-data/products'
            },
            {
                label: '客户管理',
                icon: 'pi pi-users',
                route: '/master-data/customers'
            },
            {
                label: '供应商管理',
                icon: 'pi pi-truck',
                route: '/master-data/suppliers'
            }
        ]
    },
    // 报表分析
    {
        label: '报表分析',
        items: [
            {
                label: '销售报表',
                icon: 'pi pi-chart-line',
                route: '/reports/sales'
            },
            {
                label: '库存报表',
                icon: 'pi pi-chart-bar',
                route: '/reports/inventory'
            },
            {
                label: '生产报表',
                icon: 'pi pi-chart-pie',
                route: '/reports/production'
            },
            {
                label: '采购报表',
                icon: 'pi pi-chart-bar',
                route: '/reports/purchase'
            }
        ]
    },
    // 系统设置
    {
        label: '系统设置',
        items: [
            {
                label: '系统配置',
                icon: 'pi pi-cog',
                route: '/system/config'
            },
            {
                label: '用户管理',
                icon: 'pi pi-user',
                route: '/users'
            },
            {
                label: '角色权限',
                icon: 'pi pi-shield',
                route: '/system/roles'
            },
            {
                label: '部门管理',
                icon: 'pi pi-sitemap',
                route: '/system/departments'
            },
            {
                label: '菜单管理',
                icon: 'pi pi-bars',
                route: '/system/menus'
            },
            {
                label: '岗位管理',
                icon: 'pi pi-briefcase',
                route: '/system/positions'
            },
            {
                label: '资源管理',
                icon: 'pi pi-database',
                route: '/system/resources'
            },
            {
                label: '数据字典',
                icon: 'pi pi-book',
                route: '/system/dictionaries'
            },
            {
                label: '系统日志',
                icon: 'pi pi-file',
                route: '/system/logs'
            }
        ]
    },
    {
        separator: true
    }
])

// 方法
const toggleSidebar = () => {
    emit('toggleSidebar')
}

const goToSettings = () => {
    navigateTo('/system/config')
}

const logout = async () => {
    const { auth } = useSupabaseClient()
    await auth.signOut()
    await navigateTo('/login')
}
</script>

<style scoped>
:deep(.p-menu) {
    border: none;
    background: transparent;
    color: inherit;
    padding: 1rem 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.p-menu-list) {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

:deep(.p-menu-list:hover) {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

:deep(.p-menuitem-link) {
    border: none !important;
    color: inherit !important;
    background: transparent !important;
    text-decoration: none !important;
}

:deep(.p-menuitem-link:hover) {
    background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.p-submenu-header) {
    background: transparent;
    color: var(--primary-color);
    border: none;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0 0.25rem 0;
}

:deep(.p-menu-separator) {
    margin: 0.5rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 滚动条样式 */
:deep(.p-menu-list::-webkit-scrollbar) {
    width: 6px;
}

:deep(.p-menu-list::-webkit-scrollbar-track) {
    background: transparent;
}

:deep(.p-menu-list::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

:deep(.p-menu-list::-webkit-scrollbar-thumb:hover) {
    background: rgba(255, 255, 255, 0.2);
}

/* Panel 样式优化 */
:deep(.p-panel) {
    border: none;
    background: transparent;
}

:deep(.p-panel-content) {
    border: none;
    background: transparent;
}

/* Button 样式优化 */
:deep(.p-button-secondary) {
    color: rgb(var(--surface-400));
}

:deep(.p-button-secondary:hover) {
    color: rgb(var(--surface-0));
    background: rgb(var(--surface-700));
}

:deep(.p-button-danger:hover) {
    color: rgb(var(--red-400));
    background: rgb(var(--surface-700));
}
</style> 
 
