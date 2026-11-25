/** Права ролей. Тот же порядок проверок используется в интерфейсе и в правилах доступа базы. */

import type { EntityName, Role } from './types'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  staff: 'Сотрудник',
  guest: 'Гость',
}

/** Разделы, которые ведёт сотрудник кафедры. Состав кафедры и учётные записи — только администратор. */
const STAFF_SECTIONS: EntityName[] = ['news', 'courses', 'documents', 'pages']

export function isAdmin(role: Role | null | undefined): boolean {
  return role === 'admin'
}

export function canEdit(type: EntityName, role: Role | null | undefined): boolean {
  if (role === 'admin') return true
  if (role !== 'staff') return false
  return STAFF_SECTIONS.includes(type)
}

/** Подпись для служебных разделов, доступных только администратору. */
export function adminOnlyText(what: string): string {
  return `${what} изменяет только администратор. Сотруднику доступен просмотр.`
}
