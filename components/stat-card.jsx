"use client"

export default function StatCard({ title, value, description, icon: Icon, bgColor, textColor, borderColor, isMobile }) {
  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group`}
    >
      <div className={`flex items-start ${isMobile ? "flex-col gap-2" : "justify-between mb-4"}`}>
        <div className="flex-1">
          <p className={`font-medium text-foreground mb-1 ${isMobile ? "text-xs" : "text-sm"}`}>{title}</p>
          <p className={`font-bold ${textColor} ${isMobile ? "text-2xl" : "text-3xl"}`}>{value}</p>
        </div>
        <div className={`${textColor} opacity-20 group-hover:opacity-30 transition-opacity`}>
          <Icon className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />
        </div>
      </div>
      <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}>{description}</p>
    </div>
  )
}
