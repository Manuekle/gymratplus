import {
  Activity01Icon,
  Dumbbell01Icon,
  FireIcon,
  Target01Icon,
} from "hugeicons-react";
export default function DashboardStats() {
  const stats = [
    {
      title: "Calorías quemadas",
      value: "450",
      unit: "kcal",
      change: "+12%",
      icon: <FireIcon size={28} />,
    },
    {
      title: "Entrenamientos",
      value: "4",
      unit: "esta semana",
      change: "+1",
      icon: <Dumbbell01Icon size={28} />,
    },
    {
      title: "Actividad diaria",
      value: "68",
      unit: "minutos",
      change: "+8 min",
      icon: <Activity01Icon size={28} />,
    },
    {
      title: "Progreso",
      value: "68",
      unit: "%",
      change: "+4%",
      icon: <Target01Icon size={28} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-4 rounded-lg shadow-sm border flex items-center gap-4"
        >
          <div className="p-3 rounded-full border">{stat.icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <span className="ml-1 text-xs text-gray-500">{stat.unit}</span>
            </div>
            <p className="text-xs font-medium text-green-500">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
