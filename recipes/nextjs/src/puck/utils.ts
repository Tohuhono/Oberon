export function getTitle(route: string, path?: string) {
  switch (route) {
    case "edit":
      return "Editing: " + path
    case "preview":
      return "Previewing: " + path
    case "assets":
      return "Manage Assets"
    case "users":
      return "Manage Users"
    case "pages":
    default:
      return "Oberon CMS"
  }
}
