"use client"

import { Database } from "@/types/database"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"

type Task = Database["public"]["Tables"]["tasks"]["Row"]

interface ChartViewProps {
    tasks: Task[]
}

const COLORS = ['#ccff00', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function ChartView({ tasks }: ChartViewProps) {
    // 1. Tasks by Status
    const statusData = tasks.reduce((acc, task) => {
        const status = task.status || "UNKNOWN"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const statusChartData = Object.entries(statusData).map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        value
    }))

    // 2. Tasks by Assignee
    const assigneeData = tasks.reduce((acc, task) => {
        const assignee = task.assignee_id ? "Assigned" : "Unassigned"
        acc[assignee] = (acc[assignee] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const assigneeChartData = Object.entries(assigneeData).map(([name, value]) => ({
        name,
        value
    }))

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 overflow-y-auto h-full">
            {/* Status Chart */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6">Tasks by Status</h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                cursor={{ fill: '#27272a' }}
                            />
                            <Bar dataKey="value" fill="#ccff00" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Assignee Chart */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6">Workload Distribution</h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={assigneeChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {assigneeChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
