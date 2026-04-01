export function getOrderStatusColor(status: number) {
  switch (status) {
    case 0:
      return "bg-amber-100 text-amber-800";
    case 1:
      return "bg-blue-100 text-blue-800";
    case 2:
      return "bg-cyan-100 text-cyan-800";
    case 3:
      return "bg-gray-200 text-gray-700";
    case 4:
      return "bg-indigo-100 text-indigo-800";
    case 5:
      return "bg-green-100 text-green-800";
    case 6:
      return "bg-red-100 text-red-800";
    case 7:
      return "bg-red-100 text-red-800";
    case 8:
      return "bg-red-100 text-red-800";
    case 9:
      return "bg-teal-100 text-teal-800";
    case 10:
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};