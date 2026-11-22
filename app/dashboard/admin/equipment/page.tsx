import { redirect } from "next/navigation"

/**
 * The original singular admin equipment route is kept as an alias so existing
 * bookmarks and links continue to work. The canonical route is /equipments.
 */
export default function LegacyAdminEquipmentPage() {
  redirect("/dashboard/admin/equipments")
}
