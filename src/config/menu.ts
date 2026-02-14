import {
  LayoutDashboard,
  Settings,
  UserRoundCog,
  KeySquare,
  BookUser,
  Package,
  Building2,
  Languages,
  Key,
  Cog
} from 'lucide-react'

import { AccountList } from '@modules/accounts'
import { RoleList } from '@modules/roles'
import { SidebarData } from '@/components/layout/types'
import { SystemConfigList } from '@modules/system_configs'
import { Dashboard } from '@modules/dashboard'
import { ProductList } from '@modules/products'
import { ShopList } from '@modules/shops'
import { CollectorTokenList } from '@modules/collector_tokens'
import { TranslationConfigList } from '@modules/translation_configs'

export const menuConfig: SidebarData = {

  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: '首页',
          url: '/admin/dashboard',
          icon: LayoutDashboard,
          element: Dashboard,
        }
      ],
    },
    {
      title: 'Business',
      items: [
        {
          title: '商品管理',
          url: '/admin/products',
          icon: Package,
          element: ProductList,
          permission: "product:view"
        },
        {
          title: '店铺管理',
          url: '/admin/shops',
          icon: Building2,
          element: ShopList,
          permission: "shop:view"
        },
      ]
    },
    {
      title: 'System',
      items: [
        {
          title: '配置管理',
          icon: Settings,
          items: [
            {
              title: '系统配置',
              url: '/admin/system_configs',
              icon: Cog,
              permission: "system_config:view",
              element: SystemConfigList,
            },
            {
              title: '翻译配置',
              url: '/admin/translation_configs',
              icon: Languages,
              permission: "translation_config:view",
              element: TranslationConfigList,
            },
            {
              title: '采集Token',
              url: '/admin/collector_tokens',
              icon: Key,
              permission: "collector_token:view",
              element: CollectorTokenList,
            }
          ],
        },
        {
          title: '权限管理',
          icon: BookUser,
          items: [
            {
              title: '账户',
              url: '/admin/accounts',
              icon: UserRoundCog,
              element: AccountList,
              permission: "account:view"
            },
            {
              title: '角色',
              url: '/admin/roles',
              icon: KeySquare,
              element: RoleList,
              permission: "role:view"
            },
          ],
        },

      ],
    },
  ],
}
