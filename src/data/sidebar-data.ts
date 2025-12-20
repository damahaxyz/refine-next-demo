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

import { AccountList } from '@/components/pages/accounts'
import { RoleList } from '@/components/pages/roles'
import { SidebarData } from '@/components/layout/types'
import { SysConfigList } from '@/components/pages/sys_configs'
import { Dashboard } from '@/components/pages/dashboard'

export const sidebarData: SidebarData = {

  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: '首页',
          url: '/dashboard',
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
              url: '/sys_configs',
              icon: Cog,
              permission: "SYS-CONFIG-VIEW",
              element: SysConfigList,
            }
          ],
        },
        {
          title: '权限管理',
          icon: BookUser,
          items: [
            {
              title: '账户',
              url: '/accounts',
              icon: UserRoundCog,
              element: AccountList,
              permission: "ACCOUNT-VIEW"
            },
            {
              title: '角色',
              url: '/roles',
              icon: KeySquare,
              element: RoleList,
              permission: "ROLE-VIEW"
            },
          ],
        },

      ],
    },
  ],
}
