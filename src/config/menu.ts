import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  KeySquare,
  UserRoundCog,
  UserPen,
  Cog,
  BookUser,
  Building2
} from 'lucide-react'

import { AccountList } from '@modules/accounts'
import { RoleList } from '@modules/roles'
import { SidebarData } from '@/components/layout/types'
import { SystemConfigList } from '@modules/system_configs'
import { Dashboard } from '@modules/dashboard'

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
