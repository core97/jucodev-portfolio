export function snakeToTitleCase(snakeStr: string): string {
  return snakeStr
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Convierte la primera letra en mayúscula y el resto en minúsculas
    .join(" ");
}
